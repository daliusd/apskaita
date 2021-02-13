import React, { useContext } from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  paid: boolean;
  setPaid: (v: boolean) => void;
}

export default function InvoiceEditPaid({ invoiceId, paid, setPaid }: IProps) {
  const { dispatch } = useContext<IContext>(Context);

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
      dispatch({
        type: 'SET_MESSAGE',
        text: 'įvyko klaida keičiant apmokėjimo būseną.',
        severity: 'error',
      });
      return;
    }

    setPaid(paid);
  };

  return (
    <Grid item xs={12}>
      <FormControlLabel
        control={
          <Checkbox
            checked={paid}
            onChange={handleChange}
            name="paid"
            color="primary"
          />
        }
        label={
          paid ? 'Sąskaita faktūra apmokėta' : 'Sąskaita faktūra neapmokėta'
        }
      />
    </Grid>
  );
}
