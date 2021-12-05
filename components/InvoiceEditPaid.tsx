import React from 'react';
import { useRecoilState } from 'recoil';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import {
  invoiceIdState,
  messageSeverityState,
  messageTextState,
  paidState,
} from '../src/atoms';

export default function InvoiceEditPaid() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [paid, setPaid] = useRecoilState(paidState);
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const paid = event.target.checked;

    const response = await fetch('/api/invoicespaid/' + invoiceId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paid }),
    });

    if (!response.ok || !(await response.json()).success) {
      setMessageText('Įvyko klaida keičiant apmokėjimo būseną.');
      setMessageSeverity('error');
      return;
    }

    setPaid(paid);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={paid}
          onChange={handleChange}
          name="paid"
          color="primary"
        />
      }
      label={'Apmokėta'}
    />
  );
}
