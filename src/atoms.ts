import { atom } from 'recoil';
import { IInvoice, ILineItem } from '../db/db';

type Severity = 'error' | 'success' | 'info';

export const initialInvoiceState = atom({
  key: 'initialInvoice',
  default: undefined as IInvoice,
});

export const invoiceIdState = atom({
  key: 'invoiceId',
  default: undefined as undefined | string,
});

export const languageState = atom({
  key: 'language',
  default: 'lt',
});

export const languageAfterChangeState = atom({
  key: 'languageAfterChange',
  default: null as null | string,
});

export const invoiceTypeState = atom({
  key: 'invoiceType',
  default: '',
});

export const seriesNameState = atom({
  key: 'seriesName',
  default: '',
});

export const seriesIdState = atom({
  key: 'seriesId',
  default: '',
});

export const invoiceDateState = atom({
  key: 'invoiceDate',
  default: new Date(),
});

export const sellerState = atom({
  key: 'seller',
  default: '',
});

export const buyerState = atom({
  key: 'buyer',
  default: '',
});

export const emailState = atom({
  key: 'email',
  default: '',
});

export const issuerState = atom({
  key: 'issuer',
  default: '',
});

export const extraState = atom({
  key: 'extra',
  default: '',
});

export const alreadyPaidState = atom({
  key: 'alreadyPaid',
  default: 0,
});

export const pdfnameState = atom({
  key: 'pdfname',
  default: '',
});

export const paidState = atom({
  key: 'paid',
  default: false,
});

export const lockedState = atom({
  key: 'locked',
  default: false,
});

export const sentState = atom({
  key: 'sent',
  default: false,
});

export const gdriveIdState = atom({
  key: 'gdriveId',
  default: '',
});

export const lineItemsState = atom({
  key: 'lineItems',
  default: [
    { id: 0, name: '', unit: 'vnt.', amount: 1, price: 0 },
  ] as ILineItem[],
});
