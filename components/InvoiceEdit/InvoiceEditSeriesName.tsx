import { useRecoilState } from 'recoil';
import SeriesNameInput from '../inputs/SeriesNameInput';

import { lockedState, seriesNameState } from '../../src/atoms';

export default function InvoiceEditSeriesName() {
  const [seriesName, setSeriesName] = useRecoilState(seriesNameState);
  const [locked] = useRecoilState(lockedState);

  return (
    <SeriesNameInput
      seriesName={seriesName}
      onChange={setSeriesName}
      disabled={locked}
      valid={seriesName.length > 0}
    />
  );
}
