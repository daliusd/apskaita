import React from 'react';
import { useRecoilState } from 'recoil';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import {
  invoiceIdState,
  lockedState,
  messageSeverityState,
  messageTextState,
} from '../src/atoms';

export default function InvoiceEditLocked() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [locked, setLocked] = useRecoilState(lockedState);
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const locked = event.target.checked;

    const response = await fetch('/api/invoiceslocked/' + invoiceId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locked }),
    });

    if (!response.ok || !(await response.json()).success) {
      setMessageText('Įvyko klaida užrakinant/atrakinant sąskaitą.');
      setMessageSeverity('error');
      return;
    }

    setLocked(locked);
  };

  return (
    <FormControl>
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
