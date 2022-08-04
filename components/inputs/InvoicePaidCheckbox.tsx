import React from 'react';
import { useRecoilState } from 'recoil';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { messageSeverityState, messageTextState } from '../../src/atoms';

interface IProps {
  invoiceId?: string;
  paid: boolean;
  setPaid: (v: boolean) => void;
}

export default function InvoicePaidCheckbox({
  invoiceId,
  paid,
  setPaid,
}: IProps) {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const paid = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/invoicespaid/' + invoiceId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paid }),
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
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
