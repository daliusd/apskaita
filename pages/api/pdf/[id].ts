import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import PDFDocument from 'pdfkit';

const PTPMM = 72 / 25.4;
const PAGE_WIDTH = 210 * PTPMM;
const PAGE_HEIGHT = 297 * PTPMM;
const PAGE_MARGIN = 20 * PTPMM;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

import {
  openDb,
  getInvoiceWithLineItems,
  getSetting,
  IInvoice,
} from '../../../db/db';

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

        let seller = await getSetting(db, 'seller');
        if (!seller) {
          seller = `${session.user.name}\n${session.user.email}`;
        }

        const doc = new PDFDocument({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          info: {
            Title: `Sąskaita faktūra ${invoice.seriesName}/${invoice.seriesId}`,
            Author: `${seller.split('\n')[0]} (via haiku.lt)`,
          },
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
        generateHeader(doc, invoice, seller);
        generateContent(doc, invoice, seller);
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
) {
  let y = PAGE_MARGIN + 90 * PTPMM;

  drawTableHeader(doc, y);
  y += 9 * PTPMM;

  for (let i = 0; i < invoice.lineItems.length; i++) {
    const lineItem = invoice.lineItems[i];

    drawTableRow(doc, y, 'Roboto-Light', {
      id: (i + 1).toString(),
      name: lineItem.name,
      unit: lineItem.unit,
      price: formatPrice(lineItem.price),
      amount: lineItem.amount.toString(),
      total: formatPrice(lineItem.price * lineItem.amount),
    });

    y += 7 * PTPMM;

    if (y + 7 * PTPMM > PAGE_HEIGHT - PAGE_MARGIN) {
      doc.addPage();
      drawTableHeader(doc, PAGE_MARGIN);

      y = PAGE_MARGIN + 7 * PTPMM;
    }
  }

  drawLine(doc, y);
  y += 2 * PTPMM;

  drawTableRow(doc, y, 'Roboto-Medium', {
    id: '',
    name: '',
    unit: '',
    price: 'Viso',
    amount: '',
    total: formatPrice(invoice.price),
  });

  y += 30 * PTPMM;
  if (y + 7 * PTPMM > PAGE_HEIGHT - PAGE_MARGIN) {
    doc.addPage();
    y = PAGE_MARGIN;
  }

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(`Sąskaitą išrašė ${seller.split('\n')[0]}`, PAGE_MARGIN, y);
}

function drawTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  font: string,
  lineItem: {
    id: string;
    name: string;
    unit: string;
    price: string;
    amount: string;
    total: string;
  },
) {
  // 210 - 40 = 170
  // 10 + 80 + 20 + 20 + 20 + 20
  doc
    .font(font)
    .fontSize(10)
    .text(lineItem.id, PAGE_MARGIN, y, { width: 10 * PTPMM })
    .text(lineItem.name, PAGE_MARGIN + 10 * PTPMM, y, { width: 80 * PTPMM })
    .text(lineItem.unit, PAGE_MARGIN + 90 * PTPMM, y, {
      width: 20 * PTPMM,
      align: 'right',
    })
    .text(lineItem.amount, PAGE_MARGIN + 110 * PTPMM, y, {
      width: 20 * PTPMM,
      align: 'right',
    })
    .text(lineItem.price, PAGE_MARGIN + 130 * PTPMM, y, {
      width: 20 * PTPMM,
      align: 'right',
    })
    .text(lineItem.total, PAGE_MARGIN + 150 * PTPMM, y, {
      width: 20 * PTPMM,
      align: 'right',
    });
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number) {
  drawTableRow(doc, y, 'Roboto-Medium', {
    id: 'Nr',
    name: 'Paslaugos ar prekės pavadinimas',
    unit: 'Matas',
    price: 'Kaina (€)',
    amount: 'Kiekis',
    total: 'Viso (€)',
  });

  y += 5 * PTPMM;
  drawLine(doc, y);
}

function drawLine(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .stroke();
}

function formatPrice(cents) {
  return `${(cents / 100).toFixed(2).replace('.', ',')} €`;
}
