import React, { useContext } from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  sent: boolean;
  setSent: (v: boolean) => void;
}

export default function InvoiceEditSent({ invoiceId, sent, setSent }: IProps) {
  const { dispatch } = useContext<IContext>(Context);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const sent = event.target.checked;

    const response = await fetch('/api/invoicessent/' + invoiceId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sent }),
    });

    if (!response.ok || !(await response.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Įvyko klaida pažymint sąskaitą kaip išsiųstą/neišsiųstą.',
        severity: 'error',
      });
      return;
    }

    setSent(sent);
  };

  return (
    <FormControl>
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
