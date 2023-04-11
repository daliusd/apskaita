import path from 'path';
import fsSync from 'fs';
import fs from 'fs/promises';
import PDFDocument from 'pdfkit';

import { IInvoice } from '../db/db';
import { getPriceInWords } from './priceinwords';

const PTPMM = 72 / 25.4;
const PAGE_WIDTH = 210 * PTPMM;
const PAGE_HEIGHT = 297 * PTPMM;
const PAGE_MARGIN = 20 * PTPMM;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const LOGO_WIDTH = 50 * PTPMM;

// 210 - 40 = 170
// 10 + 80 + 20 + 20 + 20 + 20 = 170
interface IFieldInfo {
  name: string;
  size: number;
  align: string;
}

const FIELDS_INFO: IFieldInfo[] = [
  {
    name: 'id',
    size: 10 * PTPMM,
    align: 'left',
  },
  {
    name: 'name',
    size: 80 * PTPMM,
    align: 'left',
  },
  {
    name: 'unit',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'amount',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'price',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'total',
    size: 20 * PTPMM,
    align: 'right',
  },
];

const FIELDS_INFO_WITH_VAT: IFieldInfo[] = [
  {
    name: 'id',
    size: 10 * PTPMM,
    align: 'left',
  },
  {
    name: 'name',
    size: 60 * PTPMM,
    align: 'left',
  },
  {
    name: 'unit',
    size: 10 * PTPMM,
    align: 'right',
  },
  {
    name: 'amount',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'price',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'vat',
    size: 10 * PTPMM,
    align: 'right',
  },
  {
    name: 'vat_sum',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'total',
    size: 20 * PTPMM,
    align: 'right',
  },
];

const FIELDS_INFO_FINAL: IFieldInfo[] = [
  {
    name: 'id',
    size: 10 * PTPMM,
    align: 'left',
  },
  {
    name: 'name',
    size: 80 * PTPMM,
    align: 'left',
  },
  {
    name: 'unit',
    size: 20 * PTPMM,
    align: 'right',
  },
  {
    name: 'amount',
    size: 0 * PTPMM,
    align: 'right',
  },
  {
    name: 'price',
    size: 40 * PTPMM,
    align: 'right',
  },
  {
    name: 'total',
    size: 20 * PTPMM,
    align: 'right',
  },
];

const invoiceStrings = {
  lt: {
    title: 'SĄSKAITA - FAKTŪRA',
    title_vat: 'PVM SĄSKAITA - FAKTŪRA',
    proforma_title: 'IŠANKSTINĖ SĄSKAITA FAKTŪRA',
    credit_title: 'KREDITINĖ SĄSKAITA FAKTŪRA',
    serie: 'Serija',
    no: 'Nr',
    seller: `Pardavėjas:`,
    buyer: `Pirkėjas:`,
    lineItemName: 'Paslaugos ar prekės pavadinimas',
    lineItemUnit: 'Mato vnt.',
    lineItemPrice: 'Kaina (€)',
    lineItemAmount: 'Kiekis',
    lineItemVat: 'PVM (%)',
    lineItemVatSum: 'PVM suma (€)',
    lineItemSum: 'Suma (€)',
    sumInWords: 'Suma žodžiais:',
    total: 'Iš viso',
    total_without_vat: 'Iš viso be PVM',
    vat: 'PVM',
    alreadyPaid: 'Sumokėta',
    sumToPay: 'Mokėti',
    invoiceIssuedBy: 'Sąskaitą išrašė',
  },
  en: {
    title: 'INVOICE',
    title_vat: 'VAT INVOICE',
    proforma_title: 'PROFORMA INVOICE',
    credit_title: 'CREDIT INVOICE',
    serie: 'Serie',
    no: 'No',
    seller: `Seller:`,
    buyer: `Buyer:`,
    lineItemName: 'Service or item name',
    lineItemUnit: 'Unit',
    lineItemVat: 'VAT (%)',
    lineItemVatSum: 'VAT sum (€))',
    lineItemPrice: 'Price (€)',
    lineItemAmount: 'Amount',
    lineItemSum: 'Sum (€)',
    sumInWords: 'Sum in words:',
    total: 'Total',
    total_without_vat: 'Total without VAT',
    vat: 'VAT',
    alreadyPaid: 'Paid',
    sumToPay: 'Sum to pay',
    invoiceIssuedBy: 'Invoice issued by',
  },
};

interface ITableLineItem {
  id: string;
  name: string;
  unit: string;
  price: string;
  amount: string;
  total: string;
  vat?: string;
  vat_sum?: string;
}

export async function generateInvoicePdf(
  invoice: IInvoice,
  zeroes: number,
  logo: string | undefined,
  logoRatio: number,
  vatpayer: boolean,
) {
  const invoicesDir = path.join(process.env.USER_DATA_PATH, 'invoices');

  if (!fsSync.existsSync(invoicesDir)) {
    await fs.mkdir(invoicesDir, { recursive: true });
  }

  let seriesId = invoice.seriesId.toString();
  if (zeroes) {
    seriesId = seriesId.padStart(zeroes, '0');
  }

  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    info: {
      Title:
        invoice.invoiceType === 'proforma'
          ? `Išankstinė sąskaita - faktūra. Serija ${invoice.seriesName} Nr. ${seriesId}`
          : invoice.invoiceType === 'credit'
          ? `Kreditinė sąskaita - faktūra. Serija ${invoice.seriesName} Nr. ${seriesId}`
          : `Sąskaita - faktūra. Serija ${invoice.seriesName} Nr. ${seriesId}`,
      Author: `${invoice.issuer} (per haiku.lt)`,
    },
    margin: 0,
    bufferPages: true,
  });

  doc.pipe(fsSync.createWriteStream(path.join(invoicesDir, invoice.pdfname)));
  doc.registerFont('Roboto-Light', './fonts/Roboto-Light.ttf');
  doc.registerFont('Roboto-Medium', './fonts/Roboto-Medium.ttf');
  const y = generateHeader(doc, invoice, seriesId, logo, logoRatio, vatpayer);
  generateContent(doc, invoice, y, vatpayer);
  doc.end();
}

export async function deleteInvoicePdf(invoice: IInvoice) {
  const invoicesDir = path.join(process.env.USER_DATA_PATH, 'invoices');

  if (!fsSync.existsSync(invoicesDir)) {
    return true;
  }

  const pdfFileName = path.join(invoicesDir, invoice.pdfname);
  if (fsSync.existsSync(pdfFileName)) {
    await fs.unlink(pdfFileName);
  }

  return true;
}

function generateHeader(
  doc: PDFKit.PDFDocument,
  invoice: IInvoice,
  seriesId: string,
  logo: string | undefined,
  logoRatio: number,
  vatpayer: boolean,
) {
  let logoHeightAdd = 0;
  if (logo) {
    doc.image(logo, PAGE_MARGIN, PAGE_MARGIN, {
      width: LOGO_WIDTH,
    });
    logoHeightAdd = Math.ceil(LOGO_WIDTH * (logoRatio || 1));
  }

  const t = invoiceStrings[invoice.language];

  doc
    .font('Roboto-Medium')
    .fontSize(14)
    .text(
      invoice.invoiceType === 'proforma'
        ? t.proforma_title
        : invoice.invoiceType === 'credit'
        ? t.credit_title
        : vatpayer
        ? t.title_vat
        : t.title,
      PAGE_MARGIN,
      PAGE_MARGIN,
      {
        width: CONTENT_WIDTH,
        align: 'center',
      },
    );

  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(
      `${t.serie} ${invoice.seriesName.normalize()} ${t.no}. ${seriesId}`,
      PAGE_MARGIN,
      PAGE_MARGIN + 8 * PTPMM,
      {
        width: CONTENT_WIDTH,
        align: 'center',
      },
    );

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(
      new Date(invoice.created).toISOString().slice(0, 10),
      PAGE_MARGIN,
      PAGE_MARGIN + 16 * PTPMM,
      {
        width: CONTENT_WIDTH,
        align: 'center',
      },
    );

  const yPos = Math.max(40 * PTPMM, logoHeightAdd + 10 * PTPMM);
  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(t.seller, PAGE_MARGIN, PAGE_MARGIN + yPos, {
      width: CONTENT_WIDTH / 2,
    });

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(
      invoice.seller.normalize(),
      PAGE_MARGIN,
      PAGE_MARGIN + yPos + 5 * PTPMM,
      {
        width: CONTENT_WIDTH / 2,
      },
    );

  const sellerHeight = doc
    .font('Roboto-Light')
    .fontSize(12)
    .heightOfString(invoice.seller, { width: CONTENT_WIDTH / 2 });

  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(t.buyer, PAGE_MARGIN + CONTENT_WIDTH / 2, PAGE_MARGIN + yPos, {
      width: CONTENT_WIDTH / 2,
      align: 'right',
    });

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(
      invoice.buyer.normalize(),
      PAGE_MARGIN + CONTENT_WIDTH / 2,
      PAGE_MARGIN + yPos + 5 * PTPMM,
      {
        width: CONTENT_WIDTH / 2,
        align: 'right',
      },
    );

  const buyerHeight = doc
    .font('Roboto-Light')
    .fontSize(12)
    .heightOfString(invoice.buyer, { width: CONTENT_WIDTH / 2 });

  return Math.max(
    PAGE_MARGIN + 90 * PTPMM,
    PAGE_MARGIN + yPos + 5 * PTPMM + sellerHeight + 20 * PTPMM,
    PAGE_MARGIN + yPos + 5 * PTPMM + buyerHeight + 20 * PTPMM,
  );
}

function generateContent(
  doc: PDFKit.PDFDocument,
  invoice: IInvoice,
  startY: number,
  vatpayer: boolean,
) {
  const t = invoiceStrings[invoice.language];

  let y = startY;

  y = drawTableHeader(doc, y, invoice.language, vatpayer);

  for (let i = 0; i < invoice.lineItems.length; i++) {
    const lineItem = invoice.lineItems[i];

    const total = lineItem.price * lineItem.amount;
    y = drawTableRow(
      doc,
      y,
      'Roboto-Light',
      invoice.language,
      {
        id: (i + 1).toString(),
        name: lineItem.name,
        unit: lineItem.unit,
        price: formatPrice(lineItem.price),
        amount: lineItem.amount.toString(),
        total: formatPrice(total),
        vat: lineItem.vat.toString(),
        vat_sum: formatPrice(
          total - Math.round(total / (1.0 + lineItem.vat / 100)),
        ),
      },
      vatpayer ? FIELDS_INFO_WITH_VAT : FIELDS_INFO,
      vatpayer,
    );
  }

  drawLine(doc, y);
  y += 2 * PTPMM;

  if (vatpayer) {
    const total_without_vat = invoice.price - invoice.vat;

    y = drawTableRow(
      doc,
      y,
      'Roboto-Medium',
      invoice.language,
      {
        id: '',
        name: '',
        unit: '',
        price: t.total_without_vat,
        amount: '',
        total: formatPrice(total_without_vat),
      },
      FIELDS_INFO_FINAL,
      vatpayer,
    );

    y = drawTableRow(
      doc,
      y,
      'Roboto-Medium',
      invoice.language,
      {
        id: '',
        name: '',
        unit: '',
        price: t.vat,
        amount: '',
        total: formatPrice(invoice.vat),
      },
      FIELDS_INFO_FINAL,
      vatpayer,
    );
  }

  y = drawTableRow(
    doc,
    y,
    'Roboto-Medium',
    invoice.language,
    {
      id: '',
      name: '',
      unit: '',
      price: t.total,
      amount: '',
      total: formatPrice(invoice.price),
    },
    FIELDS_INFO_FINAL,
    vatpayer,
  );

  if (invoice.alreadyPaid > 0) {
    y = drawTableRow(
      doc,
      y,
      'Roboto-Medium',
      invoice.language,
      {
        id: '',
        name: '',
        unit: '',
        price: t.alreadyPaid,
        amount: '',
        total: formatPrice(invoice.alreadyPaid),
      },
      FIELDS_INFO_FINAL,
      vatpayer,
    );

    y = drawTableRow(
      doc,
      y,
      'Roboto-Medium',
      invoice.language,
      {
        id: '',
        name: '',
        unit: '',
        price: t.sumToPay,
        amount: '',
        total: formatPrice(invoice.price - invoice.alreadyPaid),
      },
      FIELDS_INFO_FINAL,
      vatpayer,
    );
  }

  y += 10 * PTPMM;

  const priceInWords = `${t.sumInWords} ${getPriceInWords(
    Math.floor(invoice.price / 100),
    invoice.language,
  )} ${invoice.price % 100} ct`;

  y = drawText(doc, y, 'Roboto-Light', 12, priceInWords);
  y += 20 * PTPMM;

  if (invoice.extra) {
    y = drawText(doc, y, 'Roboto-Light', 12, invoice.extra);
    y += 10 * PTPMM;
  }

  y = drawText(
    doc,
    y,
    'Roboto-Light',
    12,
    `${t.invoiceIssuedBy} ${invoice.issuer}`,
  );
}

function drawText(
  doc: PDFKit.PDFDocument,
  y: number,
  font: string,
  fontSize: number,
  text: string,
) {
  const height = doc
    .font(font)
    .fontSize(fontSize)
    .heightOfString(text.normalize(), { width: CONTENT_WIDTH });

  y = validateOrAddPage(doc, y, height).y;

  doc
    .font(font)
    .fontSize(fontSize)
    .text(text.normalize(), PAGE_MARGIN, y, { width: CONTENT_WIDTH });
  return y + height;
}

function getTableRowHeight(
  doc: PDFKit.PDFDocument,
  font: string,
  lineItem: ITableLineItem,
  fields_info: IFieldInfo[],
) {
  const heights = [];
  for (const field of fields_info) {
    heights.push(
      doc
        .font(font)
        .fontSize(10)
        .heightOfString(lineItem[field.name], { width: field.size }),
    );
  }

  return Math.max(...heights);
}

function validateOrAddPage(doc, y, height) {
  if (y + height > PAGE_HEIGHT - PAGE_MARGIN) {
    doc.addPage();
    return { pageAdded: true, y: PAGE_MARGIN };
  }
  return { pageAdded: false, y };
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  font: string,
  language: string,
  lineItem: ITableLineItem,
  fields_info: IFieldInfo[],
  vatpayer: boolean,
) {
  const height = getTableRowHeight(doc, font, lineItem, fields_info);
  const vres = validateOrAddPage(doc, y, height);
  if (vres.pageAdded) {
    y = drawTableHeader(doc, vres.y, language, vatpayer);
  }

  let x = PAGE_MARGIN;
  for (const field of fields_info) {
    doc.font(font).fontSize(10).text(lineItem[field.name].normalize(), x, y, {
      width: field.size,
      align: field.align,
    });
    x += field.size;
  }

  y += height + 2 * PTPMM;

  return y;
}

function drawTableHeader(
  doc: PDFKit.PDFDocument,
  y: number,
  language: string,
  vatpayer: boolean,
) {
  const t = invoiceStrings[language];

  y = drawTableRow(
    doc,
    y,
    'Roboto-Medium',
    language,
    {
      id: t.no,
      name: t.lineItemName,
      unit: t.lineItemUnit,
      price: t.lineItemPrice,
      amount: t.lineItemAmount,
      vat: t.lineItemVat,
      vat_sum: t.lineItemVatSum,
      total: t.lineItemSum,
    },
    vatpayer ? FIELDS_INFO_WITH_VAT : FIELDS_INFO,
    vatpayer,
  );

  drawLine(doc, y);
  y += 2 * PTPMM;

  return y;
}

function drawLine(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(0.5 * PTPMM)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .stroke();
}

function formatPrice(cents) {
  return (cents / 100).toFixed(2).replace('.', ',');
}
