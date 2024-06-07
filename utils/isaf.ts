import { Database } from 'sqlite';
import countries from 'i18n-iso-countries';

import {
  getInvoicesForIsaf,
  getLineItemsForIsaf,
  getPurchaseInvoices,
} from '../db/db';

function escapeXml(xml: string) {
  return xml
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

const VAT_TO_CODE = {
  '21': 'PVM1',
  '9': 'PVM2',
  '0': 'PVM5',
};

export async function generateISAFXml({
  db,
  from,
  to,
  seriesName,
  registrationNumber,
  registerType, // S - sales invoices, P - purchase invoices, F - full
}: {
  db: Database;
  from: number;
  to: number;
  seriesName: string;
  registrationNumber: string;
  registerType: string;
}) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  let isaf = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<iSAFFile xmlns="http://www.vmi.lt/cms/imas/isaf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <FileDescription>
      <FileVersion>iSAF1.2</FileVersion>
      <FileDateCreated>${new Date().toISOString()}</FileDateCreated>
      <DataType>${registerType}</DataType>
      <SoftwareCompanyName>Dalius Dobravolskas</SoftwareCompanyName>
      <SoftwareName>haiku.lt</SoftwareName>
      <SoftwareVersion>${new Date()
        .toISOString()
        .slice(0, 10)}</SoftwareVersion>
      <RegistrationNumber>${escapeXml(registrationNumber)}</RegistrationNumber>
      <NumberOfParts>1</NumberOfParts>
      <PartNumber>1</PartNumber>
      <SelectionCriteria>
        <SelectionStartDate>${fromDate
          .toISOString()
          .slice(0, 10)}</SelectionStartDate>
        <SelectionEndDate>${toDate
          .toISOString()
          .slice(0, 10)}</SelectionEndDate>
      </SelectionCriteria>
    </FileDescription>
  </Header>
  <SourceDocuments>\n`;

  if (registerType === 'S' || registerType === 'F') {
    isaf = await generateSalesInvoices(db, from, to, seriesName, isaf);
  }

  if (registerType === 'P' || registerType === 'F') {
    isaf = await generatePurchaseInvoices(db, from, to, isaf);
  }

  isaf += `  </SourceDocuments>
</iSAFFile>`;

  return isaf;
}

async function generateSalesInvoices(
  db: Database,
  from: number,
  to: number,
  seriesName: string,
  isaf: string,
) {
  isaf += `    <SalesInvoices>\n`;

  const pr1 = '    ';
  const pr2 = pr1 + '  ';
  const pr3 = pr2 + '  ';
  const pr4 = pr3 + '  ';

  const invoices = await getInvoicesForIsaf(db, from, to, seriesName);

  for (const inv of invoices) {
    if (inv.vat === 0 && !inv.vatcode) {
      // This is not VAT invoice for some reason therefore we skip it
      continue;
    }

    isaf += pr1 + '<Invoice>\n';
    isaf += pr2 + `<InvoiceNo>${inv.name}</InvoiceNo>\n`;

    isaf += pr2 + '<CustomerInfo>\n';

    const vatregno = inv.buyer.match('PVM.*(LT[0-9]+)');
    isaf +=
      pr3 +
      `<VATRegistrationNumber>${vatregno ? vatregno[1] : 'ND'}</VATRegistrationNumber>\n`;
    const regno = inv.buyer.match('Į.* ([0-9]+)');
    if (!vatregno) {
      isaf +=
        pr3 +
        `<RegistrationNumber>${regno ? regno[1] : 'ND'}</RegistrationNumber>\n`;
    } else {
      isaf += pr3 + `<RegistrationNumber/>\n`;
    }

    const buyerSplit = inv.buyer.split('\n');
    let countryCode = extractCountryCode(buyerSplit, inv);

    isaf += pr3 + `<Country>${countryCode}</Country>\n`;

    let name = buyerSplit[0].trim();
    name = name.replace(/,$/, '');
    isaf += pr3 + `<Name>${escapeXml(name)}</Name>\n`;

    isaf += pr2 + '</CustomerInfo>\n';

    isaf +=
      pr2 +
      `<InvoiceDate>${new Date(inv.created)
        .toISOString()
        .slice(0, 10)}</InvoiceDate>\n`;
    isaf +=
      pr2 + `<InvoiceType>${inv.flags === 0 ? 'SF' : 'KS'}</InvoiceType>\n`;
    isaf += pr2 + '<SpecialTaxation/>\n';
    isaf += pr2 + '<References/>\n';
    isaf +=
      pr2 +
      `<VATPointDate>${new Date(inv.created)
        .toISOString()
        .slice(0, 10)}</VATPointDate>\n`;

    isaf += pr2 + '<DocumentTotals>\n';

    const itemsData = await getLineItemsForIsaf(db, inv.id);

    const taxableValueByCode = {};
    const taxableVatByCode = {};
    for (const item of itemsData) {
      const taxableValue = Math.round(
        (Math.round((item.price / (1 + item.vat / 100)) * 100) * item.amount) /
          100,
      );

      const vatcode = item.vatcode || VAT_TO_CODE[item.vat];

      if (vatcode) {
        if (!taxableVatByCode[vatcode]) {
          taxableVatByCode[vatcode] = item.vat;
        }

        if (!taxableValueByCode[vatcode]) {
          taxableValueByCode[vatcode] = 0;
        }

        taxableValueByCode[vatcode] += taxableValue;
      }
    }

    for (const vatcode of Object.keys(taxableValueByCode)) {
      const taxableValue = taxableValueByCode[vatcode];
      const vat = taxableVatByCode[vatcode];
      isaf += pr3 + '<DocumentTotal>\n';

      isaf += pr4 + `<TaxableValue>${taxableValue / 100}</TaxableValue>\n`;
      isaf += pr4 + `<TaxCode>${vatcode}</TaxCode>\n`;
      isaf += pr4 + `<TaxPercentage>${vat}</TaxPercentage>\n`;
      isaf +=
        pr4 +
        `<Amount>${Math.round((taxableValue * parseInt(vat, 10)) / 100) / 100}</Amount>\n`;
      isaf +=
        pr4 +
        `<VATPointDate2>${new Date(inv.created)
          .toISOString()
          .slice(0, 10)}</VATPointDate2>\n`;

      isaf += pr3 + '</DocumentTotal>\n';
    }

    isaf += pr2 + '</DocumentTotals>\n';

    isaf += pr1 + '</Invoice>\n';
  }

  isaf += `    </SalesInvoices>\n`;
  return isaf;
}

async function generatePurchaseInvoices(
  db: Database,
  from: number,
  to: number,
  isaf: string,
) {
  isaf += `    <PurchaseInvoices>\n`;

  const pr1 = '    ';
  const pr2 = pr1 + '  ';
  const pr3 = pr2 + '  ';
  const pr4 = pr3 + '  ';

  const invoices = await getPurchaseInvoices(db, from, to);

  for (const inv of invoices) {
    if (inv.vat === 0 && !inv.vatcode) {
      // This is not VAT invoice for some reason therefore we skip it
      continue;
    }

    isaf += pr1 + '<Invoice>\n';
    isaf += pr2 + `<InvoiceNo>${inv.invoiceno}</InvoiceNo>\n`;

    isaf += pr2 + '<SupplierInfo>\n';

    const vatregno = inv.seller.match('PVM.*(LT[0-9]+)');
    isaf +=
      pr3 +
      `<VATRegistrationNumber>${vatregno ? vatregno[1] : 'ND'}</VATRegistrationNumber>\n`;
    const regno = inv.seller.match('Į.* ([0-9]+)');
    if (!vatregno) {
      isaf +=
        pr3 +
        `<RegistrationNumber>${regno ? regno[1] : 'ND'}</RegistrationNumber>\n`;
    } else {
      isaf += pr3 + `<RegistrationNumber/>\n`;
    }

    const sellerSplit = inv.seller.split('\n');
    let countryCode = extractCountryCode(sellerSplit, inv);

    isaf += pr3 + `<Country>${countryCode}</Country>\n`;

    let name = sellerSplit[0].trim();
    name = name.replace(/,$/, '');
    isaf += pr3 + `<Name>${escapeXml(name)}</Name>\n`;

    isaf += pr2 + '</SupplierInfo>\n';

    isaf +=
      pr2 +
      `<InvoiceDate>${new Date(inv.created)
        .toISOString()
        .slice(0, 10)}</InvoiceDate>\n`;
    isaf += pr2 + `<InvoiceType>${'SF'}</InvoiceType>\n`;
    isaf += pr2 + '<SpecialTaxation/>\n';
    isaf += pr2 + '<References/>\n';
    isaf +=
      pr2 +
      `<VATPointDate>${new Date(inv.created)
        .toISOString()
        .slice(0, 10)}</VATPointDate>\n`;

    isaf += pr2 + '<DocumentTotals>\n';

    const itemsData = JSON.parse(inv.items);

    const taxableValueByCode = {};
    const taxableVatByCode = {};
    for (const item of itemsData) {
      const taxableValue = Math.round(
        (Math.round((item.price / (1 + item.vat / 100)) * 100) * item.amount) /
          100,
      );

      const vatcode = item.vatcode || VAT_TO_CODE[item.vat];

      if (vatcode) {
        if (!taxableVatByCode[vatcode]) {
          taxableVatByCode[vatcode] = item.vat;
        }

        if (!taxableValueByCode[vatcode]) {
          taxableValueByCode[vatcode] = 0;
        }

        taxableValueByCode[vatcode] += taxableValue;
      }
    }

    for (const vatcode of Object.keys(taxableValueByCode)) {
      const taxableValue = taxableValueByCode[vatcode];
      const vat = taxableVatByCode[vatcode];
      isaf += pr3 + '<DocumentTotal>\n';

      isaf += pr4 + `<TaxableValue>${taxableValue / 100}</TaxableValue>\n`;
      isaf += pr4 + `<TaxCode>${vatcode}</TaxCode>\n`;
      isaf += pr4 + `<TaxPercentage>${vat}</TaxPercentage>\n`;
      isaf +=
        pr4 +
        `<Amount>${Math.round((taxableValue * parseInt(vat, 10)) / 100) / 100}</Amount>\n`;
      isaf += pr3 + '</DocumentTotal>\n';
    }

    isaf += pr2 + '</DocumentTotals>\n';

    isaf += pr1 + '</Invoice>\n';
  }

  isaf += `    </PurchaseInvoices>\n`;
  return isaf;
}

function extractCountryCode(splitInfo: any, inv: any) {
  let country = splitInfo.at(-1);
  let countryCode = 'LT';
  if (countries.isValid(country)) {
    countryCode = country;
  } else {
    const code = countries.getAlpha2Code(country, inv.language);
    if (code) {
      countryCode = code;
    }
  }
  return countryCode;
}
