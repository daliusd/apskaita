import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Link from '../src/Link';
import {
  emailState,
  invoiceIdState,
  lockedState,
  messageSeverityState,
  messageTextState,
  sentState,
} from '../src/atoms';

interface IProps {
  disabled: boolean;
}

export default function SendInvoiceButton() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [email] = useRecoilState(emailState);
  const [sent, setSent] = useRecoilState(sentState);
  const [, setLocked] = useRecoilState(lockedState);

  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [sending, setSending] = useState(false);

  const disabled = !email || sent;

  if (!invoiceId) return null;

  const handleClick = async () => {
    if (!email) {
      setMessageText(
        'Nurodykite pirkėjo el.pašto adresą sąkaitoje faktūroje ir išsaugokite ją.',
      );
      setMessageSeverity('error');
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
      setMessageText('Klaida siunčiant sąskaitą faktūrą el. paštu.');
      setMessageSeverity('error');
      return;
    }

    const message = await response.json();
    if (!message.success) {
      setMessageText(
        message.message || 'Klaida siunčiant sąskaitą faktūrą el. paštu.',
      );
      setMessageSeverity('error');
      return;
    }

    setMessageText('Sąskaita faktūra išsiusta.');
    setMessageText('success');

    setSent(true);
    setLocked(true);
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
