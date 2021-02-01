import path from 'path';
import fs from 'fs';
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
const FIELDS_INFO: { name: string; size: number; align: string }[] = [
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

interface ITableLineItem {
  id: string;
  name: string;
  unit: string;
  price: string;
  amount: string;
  total: string;
}

export function generateInvoicePdf(
  invoice: IInvoice,
  zeroes: number,
  logo?: string,
) {
  const invoicesDir = path.join(process.env.USER_DATA_PATH, 'invoices');

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  let seriesId = invoice.seriesId.toString();
  if (zeroes) {
    seriesId = seriesId.padStart(zeroes, '0');
  }

  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    info: {
      Title: `Sąskaita - faktūra Serija ${invoice.seriesName} Nr. ${seriesId}`,
      Author: `${invoice.issuer} (per haiku.lt)`,
    },
    margin: 0,
    bufferPages: true,
  });

  doc.pipe(fs.createWriteStream(path.join(invoicesDir, invoice.pdfname)));
  doc.registerFont('Roboto-Light', './fonts/Roboto-Light.ttf');
  doc.registerFont('Roboto-Medium', './fonts/Roboto-Medium.ttf');
  addFooter(doc);
  const y = generateHeader(doc, invoice, seriesId, logo);
  generateContent(doc, invoice, y);
  doc.end();
}

export function deleteInvoicePdf(invoice: IInvoice) {
  const invoicesDir = path.join(process.env.USER_DATA_PATH, 'invoices');

  if (!fs.existsSync(invoicesDir)) {
    return true;
  }

  const pdfFileName = path.join(invoicesDir, invoice.pdfname);
  if (fs.existsSync(pdfFileName)) {
    fs.unlinkSync(pdfFileName);
  }

  return true;
}

function generateHeader(
  doc: PDFKit.PDFDocument,
  invoice: IInvoice,
  seriesId: string,
  logo?: string,
) {
  if (logo) {
    doc.image(logo, PAGE_MARGIN, PAGE_MARGIN, {
      width: LOGO_WIDTH,
    });
  }

  doc
    .font('Roboto-Medium')
    .fontSize(14)
    .text(`SĄSKAITA - FAKTŪRA`, PAGE_MARGIN, PAGE_MARGIN, {
      width: CONTENT_WIDTH,
      align: 'center',
    });

  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(
      `Serija ${invoice.seriesName.normalize()} Nr. ${seriesId}`,
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

  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(`Pardavėjas:`, PAGE_MARGIN, PAGE_MARGIN + 40 * PTPMM, {
      width: CONTENT_WIDTH / 2,
    });

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(invoice.seller.normalize(), PAGE_MARGIN, PAGE_MARGIN + 45 * PTPMM, {
      width: CONTENT_WIDTH / 2,
    });

  const sellerHeight = doc
    .font('Roboto-Light')
    .fontSize(12)
    .heightOfString(invoice.seller, { width: CONTENT_WIDTH / 2 });

  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(
      `Pirkėjas:`,
      PAGE_MARGIN + CONTENT_WIDTH / 2,
      PAGE_MARGIN + 40 * PTPMM,
      {
        width: CONTENT_WIDTH / 2,
        align: 'right',
      },
    );

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(
      invoice.buyer.normalize(),
      PAGE_MARGIN + CONTENT_WIDTH / 2,
      PAGE_MARGIN + 45 * PTPMM,
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
    PAGE_MARGIN + 45 * PTPMM + sellerHeight + 20 * PTPMM,
    PAGE_MARGIN + 45 * PTPMM + buyerHeight + 20 * PTPMM,
  );
}

function generateContent(
  doc: PDFKit.PDFDocument,
  invoice: IInvoice,
  startY: number,
) {
  let y = startY;

  y = drawTableHeader(doc, y);

  for (let i = 0; i < invoice.lineItems.length; i++) {
    const lineItem = invoice.lineItems[i];

    y = drawTableRow(doc, y, 'Roboto-Light', {
      id: (i + 1).toString(),
      name: lineItem.name,
      unit: lineItem.unit,
      price: formatPrice(lineItem.price),
      amount: lineItem.amount.toString(),
      total: formatPrice(lineItem.price * lineItem.amount),
    });
  }

  drawLine(doc, y);
  y += 2 * PTPMM;

  y = drawTableRow(doc, y, 'Roboto-Medium', {
    id: '',
    name: '',
    unit: '',
    price: 'Iš viso',
    amount: '',
    total: formatPrice(invoice.price),
  });

  y += 10 * PTPMM;

  const priceInWords = `Suma žodžiais: ${getPriceInWords(
    Math.floor(invoice.price / 100),
  )} ${invoice.price % 100} ct`;

  y = drawText(doc, y, 'Roboto-Light', 12, priceInWords);
  y += 20 * PTPMM;

  if (invoice.extra) {
    y = drawText(doc, y, 'Roboto-Light', 12, invoice.extra);
    y += 10 * PTPMM;
  }

  y = drawText(doc, y, 'Roboto-Light', 12, `Sąskaitą išrašė ${invoice.issuer}`);
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
) {
  const heights = [];
  for (const field of FIELDS_INFO) {
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
    addFooter(doc);
    return { pageAdded: true, y: PAGE_MARGIN };
  }
  return { pageAdded: false, y };
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  font: string,
  lineItem: ITableLineItem,
) {
  const height = getTableRowHeight(doc, font, lineItem);
  const vres = validateOrAddPage(doc, y, height);
  if (vres.pageAdded) {
    y = drawTableHeader(doc, vres.y);
  }

  let x = PAGE_MARGIN;
  for (const field of FIELDS_INFO) {
    doc.font(font).fontSize(10).text(lineItem[field.name].normalize(), x, y, {
      width: field.size,
      align: field.align,
    });
    x += field.size;
  }

  y += height + 2 * PTPMM;

  return y;
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  y = drawTableRow(doc, y, 'Roboto-Medium', {
    id: 'Nr',
    name: 'Paslaugos ar prekės pavadinimas',
    unit: 'Mato vnt.',
    price: 'Kaina (€)',
    amount: 'Kiekis',
    total: 'Suma (€)',
  });

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

function addFooter(doc: PDFKit.PDFDocument) {
  doc.save();

  doc
    .strokeColor('#aaaaaa')
    .lineWidth(0.25 * PTPMM)
    .dash(PTPMM, { space: PTPMM })
    .moveTo(PAGE_MARGIN, PAGE_HEIGHT - PAGE_MARGIN)
    .lineTo(PAGE_MARGIN + 50 * PTPMM, PAGE_HEIGHT - PAGE_MARGIN)
    .stroke();

  doc
    .fillColor('#aaaaaa')
    .font('Roboto-Light')
    .fontSize(8)
    .text(
      'Haiku.lt - individualios veiklos apskaita',
      PAGE_MARGIN,
      PAGE_HEIGHT - PAGE_MARGIN + PTPMM,
      {
        width: CONTENT_WIDTH,
        align: 'left',
      },
    );

  doc.restore();
}
