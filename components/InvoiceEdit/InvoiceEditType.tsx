import React from 'react';
import { useRecoilState } from 'recoil';
import InvoiceTypeSelector from '../inputs/InvoiceTypeSelector';

import {
  initialInvoiceState,
  lockedState,
  seriesNameState,
} from '../../src/atoms';

export default function InvoiceEditType() {
  const [initialInvoice] = useRecoilState(initialInvoiceState);
  const [seriesName, setSeriesName] = useRecoilState(seriesNameState);
  const [locked] = useRecoilState(lockedState);

  const onChange = (value) => {
    if (value === 'invoice') {
      setSeriesName(initialInvoice.seriesName);
    } else if (value === 'proforma') {
      setSeriesName('@');
    }
  };

  return (
    <InvoiceTypeSelector
      invoiceType={seriesName.startsWith('@') ? 'proforma' : 'invoice'}
      onChange={onChange}
      disabled={locked}
    />
  );
}
