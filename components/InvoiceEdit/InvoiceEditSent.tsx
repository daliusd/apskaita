import React from 'react';
import { useRecoilState } from 'recoil';

import { invoiceIdState, paidState, sentState } from '../../src/atoms';

import InvoiceSentCheckbox from '../inputs/InvoiceSentCheckbox';

export default function InvoiceEditSent() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [sent, setSent] = useRecoilState(sentState);

  return (
    <InvoiceSentCheckbox invoiceId={invoiceId} sent={sent} setSent={setSent} />
  );
}
