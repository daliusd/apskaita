import { useRecoilState } from 'recoil';
import SeriesNameInput from '../inputs/SeriesNameInput';

import {
  invoiceTypeState,
  lockedState,
  seriesNameState,
} from '../../src/atoms';

export default function InvoiceEditSeriesName() {
  const [seriesName, setSeriesName] = useRecoilState(seriesNameState);
  const [invoiceType] = useRecoilState(invoiceTypeState);
  const [locked] = useRecoilState(lockedState);

  return (
    <SeriesNameInput
      seriesName={seriesName}
      invoiceType={invoiceType}
      onChange={setSeriesName}
      disabled={locked}
      valid={seriesName.length > 0}
    />
  );
}
