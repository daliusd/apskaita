import React, { useContext, useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../src/Link';
import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  email: string;
  onSent: () => void;
  disabled: boolean;
}

export default function SendInvoiceButton({
  invoiceId,
  email,
  onSent,
  disabled,
}: IProps) {
  const { dispatch } = useContext<IContext>(Context);
  const [sending, setSending] = useState(false);

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

    setSending(true);

    const response = await fetch('/api/invoicemailer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId,
        email,
      }),
    });

    setSending(false);

    if (!response.ok) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Klaida siunčiant sąskaitą faktūrą el. paštu.',
        severity: 'error',
      });
      return;
    }

    const message = await response.json();
    if (!message.success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: message.message || 'Klaida siunčiant sąskaitą faktūrą el. paštu.',
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
    <>
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          aria-label="Išsiųsti Sąskaitą Faktūrą"
          onClick={handleClick}
          disabled={disabled || sending}
        >
          Išsiųsti Sąskaitą Faktūrą
        </Button>
      </Grid>
      <Grid item xs={12}>
        {email ? (
          <Typography variant="body2" component="div">
            Jūs galite išsiųsti sąskaitą faktūrą {email} adresu paspaudę šį
            mygtuką. Sąskaita faktūra bus išsiųsta iš jūsų el. pašto adreso
            naudojant laiško šabloną, kurį galite pakeisti{' '}
            <Link href="/nustatymai">nustatymuose</Link>. Daugiau informacijos
            straipsnyje{' '}
            <Link href="/straipsniai/saskaitu-fakturu-siuntimas">
              „Sąskaitų faktūrų siuntimas“
            </Link>
            .
          </Typography>
        ) : (
          <Typography variant="body2" component="div">
            Jei norite išsiųsti sąskaitą faktūrą el. paštu nurodykite pirkėjo
            el. paštą aukščiau.
          </Typography>
        )}
      </Grid>
    </>
  );
}
