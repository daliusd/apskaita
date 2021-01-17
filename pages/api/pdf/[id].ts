import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import PDFDocument from 'pdfkit';

const PTPMM = 72 / 25.4;
const PAGE_WIDTH = 210 * PTPMM;
const PAGE_HEIGHT = 297 * PTPMM;
const PAGE_MARGIN = 20 * PTPMM;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

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

import {
  openDb,
  getInvoiceWithLineItems,
  getSetting,
  IInvoice,
} from '../../../db/db';
import { getPriceInWords } from '../../../utils/priceinwords';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (session) {
    if (req.method === 'GET') {
      let db;

      try {
        db = await openDb(session.user.email);

        const {
          query: { id },
        } = req;

        const invoiceId = typeof id === 'string' ? id : id[0];

        const invoice = await getInvoiceWithLineItems(
          db,
          parseInt(invoiceId, 10),
        );

        const seller =
          invoice.seller ||
          (await getSetting(db, 'seller')) ||
          `${session.user.name}\n${session.user.email}`;

        const issuer =
          invoice.issuer ||
          (await getSetting(db, 'issuer')) ||
          session.user.name;

        const extra = await getSetting(db, 'extra');

        const doc = new PDFDocument({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          info: {
            Title: `Sąskaita faktūra ${invoice.seriesName}/${invoice.seriesId}`,
            Author: `${seller.split('\n')[0]} (via haiku.lt)`,
          },
          margin: 0,
          bufferPages: true,
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          res
            .writeHead(200, {
              'Content-Length': Buffer.byteLength(pdfData),
              'Content-Type': 'application/pdf',
              'Content-disposition': `attachment;filename=${
                invoice.seriesName
              }${invoice.seriesId.toString().padStart(6, '0')}.pdf`,
            })
            .end(pdfData);
        });

        doc.registerFont('Roboto-Light', './fonts/Roboto-Light.ttf');
        doc.registerFont('Roboto-Medium', './fonts/Roboto-Medium.ttf');
        addFooter(doc);
        generateHeader(doc, invoice, seller);
        generateContent(doc, invoice, seller, issuer, extra);
        doc.end();
        return;
      } catch (ex) {
        // TODO: e-mail server side rendering errors
        res.status(400);
      } finally {
        if (db) {
          await db.close();
        }
      }
    }
  } else {
    res.status(401);
  }
  res.end();
};

function generateHeader(
  doc: PDFKit.PDFDocument,
  invoice: IInvoice,
  seller: string,
) {
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
      `Serija ${invoice.seriesName} Nr. ${invoice.seriesId}`,
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
    .text(`${seller}`, PAGE_MARGIN, PAGE_MARGIN + 45 * PTPMM, {
      width: CONTENT_WIDTH / 2,
    });

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
      `${invoice.buyer}`,
      PAGE_MARGIN + CONTENT_WIDTH / 2,
      PAGE_MARGIN + 45 * PTPMM,
      {
        width: CONTENT_WIDTH / 2,
        align: 'right',
      },
    );
}

function generateContent(
  doc: PDFKit.PDFDocument,
  invoice: IInvoice,
  seller: string,
  issuer: string,
  extra: string,
) {
  let y = PAGE_MARGIN + 90 * PTPMM;

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

  if (extra) {
    y = drawText(doc, y, 'Roboto-Light', 12, extra);
    y += 10 * PTPMM;
  }

  y = drawText(doc, y, 'Roboto-Light', 12, `Sąskaitą išrašė ${issuer}`);
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
    .heightOfString(text, { width: CONTENT_WIDTH });

  y = validateOrAddPage(doc, y, height).y;

  doc.font(font).fontSize(fontSize).text(text, PAGE_MARGIN, y);
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
    doc.font(font).fontSize(10).text(lineItem[field.name], x, y, {
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
