import React from 'react';
import { useRecoilState } from 'recoil';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { messageSeverityState, messageTextState } from '../../src/atoms';

interface IProps {
  invoiceId?: string;
  sent: boolean;
  setSent: (v: boolean) => void;
}

export default function InvoiceSentCheckbox({
  invoiceId,
  sent,
  setSent,
}: IProps) {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const sent = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/invoicessent/' + invoiceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sent }),
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      setMessageText(
        'Įvyko klaida pažymint sąskaitą kaip išsiųstą/neišsiųstą.',
      );
      setMessageSeverity('error');
      return;
    }

    setSent(sent);
  };

  return (
    <FormControl variant="standard">
      <FormControlLabel
        control={
          <Checkbox
            checked={sent}
            onChange={handleChange}
            name="sent"
            color="primary"
          />
        }
        label={'Išsiųsta'}
      />
    </FormControl>
  );
}
