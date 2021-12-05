import React from 'react';
import { useRecoilState } from 'recoil';

import { invoiceIdState, lockedState } from '../src/atoms';

import InvoiceEditLocked from './InvoiceEditLocked';

export default function InvoiceEditEditLocked() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [locked, setLocked] = useRecoilState(lockedState);

  return (
    <InvoiceEditLocked
      invoiceId={invoiceId}
      locked={locked}
      setLocked={setLocked}
    />
  );
}
