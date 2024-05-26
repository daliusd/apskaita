import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Button, Grid, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import Link from '../../src/Link';
import {
  emailState,
  invoiceIdState,
  lockedState,
  sentState,
} from '../../src/atoms';
import { postInvoicemailer } from '../api/postInvoicemailer';

interface IProps {
  disabled: boolean;
}

export default function SendInvoiceButton() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [email] = useRecoilState(emailState);
  const [sent, setSent] = useRecoilState(sentState);
  const [, setLocked] = useRecoilState(lockedState);

  const [sending, setSending] = useState(false);

  const disabled = !email || sent;

  if (!invoiceId) return null;

  const handleClick = async () => {
    if (!email) {
      notifications.show({
        message:
          'Nurodykite pirkėjo el.pašto adresą sąkaitoje faktūroje ir išsaugokite ją.',
        color: 'red',
      });
      return;
    }

    setSending(true);
    const result = await postInvoicemailer(invoiceId, email);
    setSending(false);

    if (!result.success) {
      notifications.show({
        message:
          result.message || 'Klaida siunčiant sąskaitą faktūrą el. paštu.',
        color: 'red',
      });
      return;
    }

    notifications.show({
      message: 'Sąskaita faktūra išsiusta.',
      color: 'green',
    });

    setSent(true);
    setLocked(true);
  };

  return (
    <>
      <Grid.Col span={12}>
        <Button
          variant="filled"
          aria-label="Išsiųsti Sąskaitą Faktūrą"
          onClick={handleClick}
          disabled={disabled || sending}
        >
          Išsiųsti Sąskaitą Faktūrą
        </Button>
      </Grid.Col>
      <Grid.Col span={12}>
        {email ? (
          <Text>
            Jūs galite išsiųsti sąskaitą faktūrą paspaudę šį mygtuką. Laiškas
            bus išsiųstas „{email}“. Sąskaita faktūra bus išsiųsta iš jūsų el.
            pašto adreso naudojant laiško šabloną, kurį galite pakeisti{' '}
            <Link href="/nustatymai">nustatymuose</Link>. Daugiau informacijos
            straipsnyje{' '}
            <Link href="/straipsniai/saskaitu-fakturu-siuntimas">
              „Sąskaitų faktūrų siuntimas“
            </Link>
            .
          </Text>
        ) : (
          <Text>
            Jei norite išsiųsti sąskaitą faktūrą el. paštu nurodykite pirkėjo
            el. paštą aukščiau.
          </Text>
        )}
      </Grid.Col>
    </>
  );
}
