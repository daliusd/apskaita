import { getQuickJS, shouldInterruptAfterDeadline } from 'quickjs-emscripten';
import { getMsSinceEpoch } from '../../utils/date';
import { ILineItem } from '../../db/db';

export async function runExtraInputProgram({
  lineItems,
  invoiceType,
  seriesName,
  seriesId,
  invoiceDate,
  language,
  seller,
  buyer,
  email,
  issuer,
  extraInputProgram,
}: {
  lineItems: ILineItem[];
  invoiceType: string;
  seriesName: string;
  seriesId: string;
  invoiceDate: Date;
  language: string;
  seller: string;
  buyer: string;
  email: string;
  issuer: string;
  extraInputProgram: string;
}) {
  const qjs = await getQuickJS();

  const price = (lineItems || [])
    .map((g) => g.price * g.amount)
    .reduce((a, b) => a + b, 0);

  const program = `
const invoiceType = ${JSON.stringify(invoiceType || 'standard')};
const seriesName = ${JSON.stringify(seriesName)};
const seriesId = ${seriesId};
const date = new Date(${getMsSinceEpoch(invoiceDate || new Date())});
const language = ${JSON.stringify(language || 'lt')};
const seller = ${JSON.stringify(seller)};
const buyer = ${JSON.stringify(buyer)};
const email = ${JSON.stringify(email)};
const issuer = ${JSON.stringify(issuer)};
const items = ${JSON.stringify(lineItems || [])};
const price = ${price};

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

${extraInputProgram}
        `;

  const result = qjs.evalCode(program, {
    shouldInterrupt: shouldInterruptAfterDeadline(Date.now() + 5000),
    memoryLimitBytes: 1024 * 1024,
  });
  return result;
}
