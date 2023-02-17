import React from 'react';
import { useRecoilState } from 'recoil';
import InvoiceTypeSelector from '../inputs/InvoiceTypeSelector';

import { lockedState, invoiceTypeState } from '../../src/atoms';

export default function InvoiceEditType() {
  const [invoiceType, setInvoiceType] = useRecoilState(invoiceTypeState);
  const [locked] = useRecoilState(lockedState);

  const onChange = (value) => {
    setInvoiceType(value);
  };

  return (
    <InvoiceTypeSelector
      invoiceType={invoiceType === 'proforma' ? 'proforma' : 'standard'}
      onChange={onChange}
      disabled={locked}
    />
  );
}
