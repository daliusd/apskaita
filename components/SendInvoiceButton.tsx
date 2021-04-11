import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  email: string;
  onSent: () => void;
}

export default function SendInvoiceButton({
  invoiceId,
  email,
  onSent,
}: IProps) {
  const { dispatch } = useContext<IContext>(Context);

  if (!invoiceId) return null;

  const handleClick = async () => {
    if (!email) {
      dispatch({
        type: 'SET_MESSAGE',
        text:
          'Nurodykite pirkėjo el.pašto adresą sąkaitoje faktūroje ir išsaugokite ją.',
        severity: 'error',
      });
      return;
    }

    const response = await fetch('/api/invoicemailer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
      }),
    });

    if (!response.ok || !(await response.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Klaida siunčiant sąskaitą faktūrą el. paštu.',
        severity: 'error',
      });
      return;
    }

    dispatch({
      type: 'SET_MESSAGE',
      text: 'Sąskaita faktūra išsiusta.',
      severity: 'success',
    });

    onSent();
  };

  return (
    <Grid item xs={12}>
      <Button
        variant="contained"
        color="primary"
        aria-label="Išsiųsti Sąskaitą Faktūrą"
        onClick={handleClick}
      >
        Išsiųsti Sąskaitą Faktūrą
      </Button>
    </Grid>
  );
}
