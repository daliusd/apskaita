import { NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';

const PTPMM = 72 / 25.4;
const PAGE_WIDTH = 210 * PTPMM;
const PAGE_HEIGHT = 297 * PTPMM;
const PAGE_MARGIN = 20 * PTPMM;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

// 210 - 40 = 170
// 15 + 15 + 25 + 55 + 15 + 35 + 5 + 5 = 170
const EXP_COLUMN_WIDTH = 35 * PTPMM;
const SPANNED_EXP_COLUMN_WIDTH = 45 * PTPMM;

interface ICell {
  name: string;
  size: number;
  align: 'center' | 'justify' | 'left' | 'right' | undefined;
}

interface ITableItem {
  id: string;
  created: string;
  name: string;
  description: string;
  price: string;
  expense: string;
}

const CELLS: ICell[] = [
  {
    name: 'id',
    size: 15 * PTPMM,
    align: 'left',
  },
  {
    name: 'created',
    size: 15 * PTPMM,
    align: 'left',
  },
  {
    name: 'name',
    size: 25 * PTPMM,
    align: 'left',
  },
  {
    name: 'description',
    size: 55 * PTPMM,
    align: 'left',
  },
  {
    name: 'price',
    size: 15 * PTPMM,
    align: 'right',
  },
  {
    name: 'expense',
    size: EXP_COLUMN_WIDTH,
    align: 'right',
  },
  {
    name: 'expense2',
    size: 5 * PTPMM,
    align: 'right',
  },
  {
    name: 'expense3',
    size: 5 * PTPMM,
    align: 'right',
  },
];

export interface PdfInfo {
  journal: {
    created: number;
    name: string;
    price: number;
    flags: number;
    description: string;
  }[];
  personalInfo: string;
  location: string;
  activityName: string;
}

export async function generateJournalPdf(
  res: NextApiResponse,
  pdfInfo: PdfInfo,
  resolve: (value?: void) => void,
) {
  let buffers = [];

  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    info: {
      Title:
        'GYVENTOJO INDIVIDUALIOS VEIKLOS PAJAMŲ IR IŠLAIDŲ APSKAITOS ŽURNALAS',
      Author: `${pdfInfo.personalInfo} (per haiku.lt)`,
    },
    margin: 0,
    bufferPages: true,
  });

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    let pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': 'inline;filename=zurnalas.pdf',
      })
      .end(pdfData);
    resolve();
  });
  doc.registerFont('Roboto-Light', './fonts/Roboto-Light.ttf');
  doc.registerFont('Roboto-Medium', './fonts/Roboto-Medium.ttf');

  generateHeader(doc, pdfInfo);
  generateContent(doc, pdfInfo);

  doc.end();
}

function generateHeader(doc: PDFKit.PDFDocument, pdfInfo: PdfInfo) {
  doc
    .font('Roboto-Medium')
    .fontSize(12)
    .text(
      'GYVENTOJO INDIVIDUALIOS VEIKLOS PAJAMŲ IR IŠLAIDŲ APSKAITOS ŽURNALAS',
      PAGE_MARGIN,
      PAGE_MARGIN,
      {
        width: CONTENT_WIDTH,
        align: 'center',
      },
    );

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(pdfInfo.personalInfo, PAGE_MARGIN, PAGE_MARGIN + 12 * PTPMM, {
      width: CONTENT_WIDTH,
      align: 'center',
    });
  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(PAGE_MARGIN + 20 * PTPMM, PAGE_MARGIN + 18 * PTPMM)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN - 20 * PTPMM, PAGE_MARGIN + 18 * PTPMM)
    .stroke();
  doc
    .font('Roboto-Light')
    .fontSize(10)
    .text(
      '(Gyventojo vardas, pavardė, asmens kodas)',
      PAGE_MARGIN,
      PAGE_MARGIN + 18 * PTPMM,
      {
        width: CONTENT_WIDTH,
        align: 'center',
      },
    );

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(pdfInfo.location, PAGE_MARGIN, PAGE_MARGIN + 24 * PTPMM, {
      width: CONTENT_WIDTH,
      align: 'center',
    });
  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(PAGE_MARGIN + 20 * PTPMM, PAGE_MARGIN + 30 * PTPMM)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN - 20 * PTPMM, PAGE_MARGIN + 30 * PTPMM)
    .stroke();
  doc
    .font('Roboto-Light')
    .fontSize(10)
    .text('(Gyvenamoji vieta)', PAGE_MARGIN, PAGE_MARGIN + 30 * PTPMM, {
      width: CONTENT_WIDTH,
      align: 'center',
    });

  doc
    .font('Roboto-Light')
    .fontSize(12)
    .text(pdfInfo.activityName, PAGE_MARGIN, PAGE_MARGIN + 36 * PTPMM, {
      width: CONTENT_WIDTH,
      align: 'center',
    });
  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(PAGE_MARGIN + 20 * PTPMM, PAGE_MARGIN + 42 * PTPMM)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN - 20 * PTPMM, PAGE_MARGIN + 42 * PTPMM)
    .stroke();
  doc
    .font('Roboto-Light')
    .fontSize(10)
    .text('(Veiklos pavadinimas)', PAGE_MARGIN, PAGE_MARGIN + 42 * PTPMM, {
      width: CONTENT_WIDTH,
      align: 'center',
    });
}

const TABLE_HEADER: ITableItem = {
  id: 'Eilės numeris',
  created: 'Data',
  name: 'Dokumento data, pavadinimas ir numeris',
  description: 'Operacijos turinys',
  price: 'Pajamų suma (EUR)',
  expense: '',
};

const EXP_TEXT_1 =
  'Išlaidos – leidžiami atskaitymai, susiję su individualios veiklos pajamų gavimu arba uždirbimu';

const EXP_TEXT_2 = 'prekių, medžiagų, žaliavų, detalių įsigijimo';

function generateContent(doc: PDFKit.PDFDocument, pdfInfo: PdfInfo) {
  let y = generateTableHeader(doc);

  let idx = 1;
  let total_income = 0;
  let total_expenses = 0;
  for (const item of pdfInfo.journal) {
    const tableItem: ITableItem = {
      id: idx.toString(),
      created: new Date(item.created).toISOString().slice(0, 10),
      name: item.name,
      description: item.description,
      price:
        item.flags === 0
          ? (item.price / 100).toFixed(2)
          : item.flags === 2
            ? (-item.price / 100).toFixed(2)
            : '',
      expense: item.flags === 3 ? (item.price / 100).toFixed(2) : '',
    };

    y = generateTableRow(doc, tableItem, y);
    idx += 1;

    if (item.flags === 3) {
      total_expenses += item.price;
    } else {
      total_income +=
        item.flags === 0 ? item.price : item.flags === 2 ? -item.price : 0;
    }
  }

  const tableItem: ITableItem = {
    id: 'Suma',
    created: '',
    name: '',
    description: '',
    price: (total_income / 100).toFixed(2),
    expense: (total_expenses / 100).toFixed(2),
  };
  y = generateTableRow(doc, tableItem, y);

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .stroke();
}

function generateTableHeader(doc: PDFKit.PDFDocument) {
  let maxHeight = getTableRowHeight(doc, TABLE_HEADER);

  const expHeader1Height = doc
    .font('Roboto-Light')
    .fontSize(8)
    .heightOfString(EXP_TEXT_1, { width: SPANNED_EXP_COLUMN_WIDTH });
  const expHeader2Height = doc
    .font('Roboto-Light')
    .fontSize(8)
    .heightOfString(EXP_TEXT_2, { width: EXP_COLUMN_WIDTH });

  maxHeight = Math.max(maxHeight, expHeader1Height + expHeader2Height);

  let y = PAGE_MARGIN + 54 * PTPMM;
  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .stroke();

  let x = PAGE_MARGIN;
  for (const field of CELLS) {
    if (!field.name.startsWith('expense')) {
      doc
        .strokeColor('#000000')
        .lineWidth(0.25 * PTPMM)
        .moveTo(x, y)
        .lineTo(x, y + maxHeight)
        .stroke();

      doc
        .font('Roboto-Light')
        .fontSize(8)
        .text(TABLE_HEADER[field.name].normalize(), x, y, {
          width: field.size,
          align: 'center',
        });

      x += field.size;
    }
  }

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(x, y)
    .lineTo(x, y + maxHeight)
    .stroke();

  doc.font('Roboto-Light').fontSize(8).text(EXP_TEXT_1.normalize(), x, y, {
    width: SPANNED_EXP_COLUMN_WIDTH,
    align: 'center',
  });

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(x, y + expHeader1Height)
    .lineTo(x + SPANNED_EXP_COLUMN_WIDTH, y + expHeader1Height)
    .stroke();

  doc
    .font('Roboto-Light')
    .fontSize(8)
    .text(EXP_TEXT_2.normalize(), x, y + expHeader1Height, {
      width: EXP_COLUMN_WIDTH,
      align: 'center',
    });

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(x + EXP_COLUMN_WIDTH, y + expHeader1Height)
    .lineTo(x + EXP_COLUMN_WIDTH, y + maxHeight)
    .stroke();

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(x + EXP_COLUMN_WIDTH + 5 * PTPMM, y + expHeader1Height)
    .lineTo(x + EXP_COLUMN_WIDTH + 5 * PTPMM, y + maxHeight)
    .stroke();

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(x + SPANNED_EXP_COLUMN_WIDTH, y)
    .lineTo(x + SPANNED_EXP_COLUMN_WIDTH, y + maxHeight)
    .stroke();
  return y + maxHeight;
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  tableItem: ITableItem,
  y: number,
) {
  let maxHeight = getTableRowHeight(doc, tableItem);
  let info = validateOrAddPage(doc, y, maxHeight);
  if (info.pageAddRequired) {
    doc
      .strokeColor('#000000')
      .lineWidth(0.25 * PTPMM)
      .moveTo(PAGE_MARGIN, y)
      .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
      .stroke();
    doc.addPage();
    y = info.y;
  }

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(PAGE_WIDTH - PAGE_MARGIN, y)
    .stroke();

  let x = PAGE_MARGIN;
  for (const field of CELLS) {
    doc
      .strokeColor('#000000')
      .lineWidth(0.25 * PTPMM)
      .moveTo(x, y)
      .lineTo(x, y + maxHeight)
      .stroke();

    doc
      .font('Roboto-Light')
      .fontSize(8)
      .text((tableItem[field.name] || '').normalize(), x, y, {
        width: field.size,
        align: field.align,
      });

    x += field.size;
  }

  doc
    .strokeColor('#000000')
    .lineWidth(0.25 * PTPMM)
    .moveTo(x, y)
    .lineTo(x, y + maxHeight)
    .stroke();

  return y + maxHeight;
}

function getTableRowHeight(doc: PDFKit.PDFDocument, tableItem: ITableItem) {
  const heights = [];
  for (const field of CELLS) {
    heights.push(
      doc
        .font('Roboto-Light')
        .fontSize(8)
        .heightOfString(tableItem[field.name], { width: field.size }),
    );
  }

  return Math.max(...heights);
}

function validateOrAddPage(doc: PDFKit.PDFDocument, y: number, height: number) {
  if (y + height > PAGE_HEIGHT - PAGE_MARGIN) {
    return { pageAddRequired: true, y: PAGE_MARGIN };
  }
  return { pageAddRequired: false, y };
}
