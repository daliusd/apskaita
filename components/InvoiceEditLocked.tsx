import React, { useContext } from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  locked: boolean;
  setLocked: (v: boolean) => void;
}

export default function InvoiceEditLocked({
  invoiceId,
  locked,
  setLocked,
}: IProps) {
  const { dispatch } = useContext<IContext>(Context);

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
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Įvyko klaida užrakinant/atrakinant sąskaitą.',
        severity: 'error',
      });
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
