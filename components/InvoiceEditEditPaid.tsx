import React from 'react';
import { useRecoilState } from 'recoil';

import { invoiceIdState, paidState } from '../src/atoms';

import InvoiceEditPaid from './InvoiceEditPaid';

export default function InvoiceEditEditPaid() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [paid, setPaid] = useRecoilState(paidState);

  return (
    <InvoiceEditPaid invoiceId={invoiceId} paid={paid} setPaid={setPaid} />
  );
}
