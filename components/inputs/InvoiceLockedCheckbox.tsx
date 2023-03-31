import { useRecoilState } from 'recoil';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { messageSeverityState, messageTextState } from '../../src/atoms';

interface IProps {
  invoiceId?: string;
  locked: boolean;
  setLocked: (v: boolean) => void;
}

export default function InvoiceLockedCheckbox({
  invoiceId,
  locked,
  setLocked,
}: IProps) {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const locked = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/invoiceslocked/' + invoiceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locked }),
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      setMessageText('Įvyko klaida užrakinant/atrakinant sąskaitą.');
      setMessageSeverity('error');
      return;
    }

    setLocked(locked);
  };

  return (
    <FormControl variant="standard">
      <FormControlLabel
        control={
          <Checkbox
            checked={locked}
            onChange={handleChange}
            name="locked"
            color="primary"
          />
        }
        label={'Užrakinta'}
      />
    </FormControl>
  );
}
