import { Database } from 'sqlite';
import { getInvoicesForIsaf, getLineItemsForIsaf } from '../db/db';

function escapeXml(xml: string) {
  return xml
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export async function generateISAFXml({
  db,
  from,
  to,
  seriesName,
  registrationNumber,
}: {
  db: Database;
  from: number;
  to: number;
  seriesName: string;
  registrationNumber: string;
}) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  let isaf = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<iSAFFile xmlns="http://www.vmi.lt/cms/imas/isaf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <FileDescription>
      <FileVersion>iSAF1.2</FileVersion>
      <FileDateCreated>${new Date().toISOString()}</FileDateCreated>
      <DataType>S</DataType>
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
  <SourceDocuments>
    <SalesInvoices>\n`;

  const pr1 = '    ';
  const pr2 = pr1 + '  ';
  const pr3 = pr2 + '  ';
  const pr4 = pr3 + '  ';

  const invoices = await getInvoicesForIsaf(db, from, to, seriesName);

  for (const inv of invoices) {
    if (inv.vat === 0) {
      // This is not VAT invoice for some reason therefore we skip it
      continue;
    }

    isaf += pr1 + '<Invoice>\n';
    isaf += pr2 + `<InvoiceNo>${inv.name}</InvoiceNo>\n`;

    isaf += pr2 + '<CustomerInfo>\n';

    const vatregno = inv.buyer.match('PVM.*(LT[0-9]+)');
    isaf +=
      pr3 +
      `<VATRegistrationNumber>${
        vatregno ? vatregno[1] : 'ND'
      }</VATRegistrationNumber>\n`;
    const regno = inv.buyer.match('Į.* ([0-9]+)');
    if (!vatregno) {
      isaf +=
        pr3 +
        `<RegistrationNumber>${regno ? regno[1] : 'ND'}</RegistrationNumber>\n`;
    } else {
      isaf += pr3 + `<RegistrationNumber/>\n`;
    }

    isaf += pr3 + `<Country>LT</Country>\n`;
    let name = inv.buyer.split('\n')[0].trim();
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

    isaf += pr2 + '<DocumentTotals>\n';

    const itemsData = await getLineItemsForIsaf(db, inv.id);

    const taxableByTax = {};
    for (const item of itemsData) {
      const taxableValue =
        Math.round(item.price / (1 + item.vat / 100)) * item.amount;
      if (!taxableByTax[item.vat]) {
        taxableByTax[item.vat] = 0;
      }

      taxableByTax[item.vat] += taxableValue;
    }

    for (const vat of Object.keys(taxableByTax)) {
      const taxableValue = taxableByTax[vat];
      isaf += pr3 + '<DocumentTotals>\n';

      isaf += pr4 + `<TaxableValue>${taxableValue / 100}</TaxableValue>\n`;
      isaf +=
        pr4 +
        `<TaxCode>${
          vat === '21' ? 'PVM1' : vat === '9' ? 'PVM2' : ''
        }</TaxCode>\n`;
      isaf += pr4 + `<TaxPercentage>${vat}</TaxPercentage>\n`;
      isaf +=
        pr4 +
        `<Amount>${
          Math.round((taxableValue * parseInt(vat, 10)) / 100) / 100
        }</Amount>\n`;
      isaf +=
        pr4 +
        `<VATPointDate>${new Date(inv.created)
          .toISOString()
          .slice(0, 10)}</VATPointDate>\n`;

      isaf += pr3 + '</DocumentTotals>\n';
    }

    isaf += pr2 + '</DocumentTotals>\n';

    isaf += pr1 + '</Invoice>\n';
  }

  isaf += `    </SalesInvoices>
  </SourceDocuments>
</iSAFFile>`;

  return isaf;
}
