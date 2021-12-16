import React from 'react';
import { useRecoilState } from 'recoil';

import { invoiceIdState, paidState } from '../../src/atoms';

import InvoicePaidCheckbox from './InvoicePaidCheckbox';

export default function InvoiceEditPaid() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [paid, setPaid] = useRecoilState(paidState);

  return (
    <InvoicePaidCheckbox invoiceId={invoiceId} paid={paid} setPaid={setPaid} />
  );
}
