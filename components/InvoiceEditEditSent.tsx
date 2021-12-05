import React from 'react';
import { useRecoilState } from 'recoil';

import { invoiceIdState, paidState, sentState } from '../src/atoms';

import InvoiceEditSent from './InvoiceEditSent';

export default function InvoiceEditEditSent() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [sent, setSent] = useRecoilState(sentState);

  return (
    <InvoiceEditSent invoiceId={invoiceId} sent={sent} setSent={setSent} />
  );
}
