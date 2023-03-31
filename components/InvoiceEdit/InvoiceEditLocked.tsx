import { useRecoilState } from 'recoil';

import { invoiceIdState, lockedState } from '../../src/atoms';

import InvoiceLockedCheckbox from '../inputs/InvoiceLockedCheckbox';

export default function InvoiceEditLocked() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [locked, setLocked] = useRecoilState(lockedState);

  return (
    <InvoiceLockedCheckbox
      invoiceId={invoiceId}
      locked={locked}
      setLocked={setLocked}
    />
  );
}
