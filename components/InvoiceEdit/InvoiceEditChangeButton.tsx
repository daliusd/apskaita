import { useRef } from 'react';
import { useRecoilState } from 'recoil';
import { IconPlus, IconDeviceFloppy } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-use';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { IInvoice } from '../../db/db';
import { getMsSinceEpoch } from '../../utils/date';

import {
  alreadyPaidState,
  buyerState,
  emailState,
  extraState,
  invoiceDateState,
  invoiceIdState,
  invoiceTypeState,
  issuerState,
  languageState,
  lineItemsState,
  sellerState,
  seriesIdState,
  seriesNameState,
} from '../../src/atoms';

export default function InvoiceEditChangeButton() {
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [invoiceType] = useRecoilState(invoiceTypeState);
  const [seriesName] = useRecoilState(seriesNameState);
  const [seriesId] = useRecoilState(seriesIdState);
  const [invoiceDate] = useRecoilState(invoiceDateState);
  const [seller] = useRecoilState(sellerState);
  const [buyer] = useRecoilState(buyerState);
  const [email] = useRecoilState(emailState);
  const [issuer] = useRecoilState(issuerState);
  const [extra] = useRecoilState(extraState);
  const [language] = useRecoilState(languageState);
  const [lineItems] = useRecoilState(lineItemsState);
  const [alreadyPaid] = useRecoilState(alreadyPaidState);
  const [code] = useLocalStorage('code', '');

  const router = useRouter();

  const inProcess = useRef(false);

  return (
    <Button
      type="submit"
      aria-label={invoiceId ? 'Saugoti' : 'Sukurti'}
      variant="filled"
      leftSection={invoiceId ? <IconDeviceFloppy /> : <IconPlus />}
      onClick={async () => {
        if (!seriesName) {
          notifications.show({
            message: 'Nurodykite serijos pavadinimą.',
            color: 'red',
          });
          return;
        }

        const created = getMsSinceEpoch(invoiceDate);
        if (!created) {
          notifications.show({
            message: 'Nurodykite sąskaitos datą.',
            color: 'red',
          });
          return;
        }

        if (!seller) {
          notifications.show({
            message: 'Nurodykite pardavėjo duomenis.',
            color: 'red',
          });
          return;
        }

        if (!buyer) {
          notifications.show({
            message: 'Nurodykite pirkėjo duomenis.',
            color: 'red',
          });
          return;
        }

        if (!issuer) {
          notifications.show({
            message: 'Nurodykite kas išrašė sąskaitą faktūrą.',
            color: 'red',
          });
          return;
        }

        if (lineItems.some((li) => !li.name)) {
          notifications.show({
            message: 'Nurodykite paslaugų ar prekių pavadinimus.',
            color: 'red',
          });
          return;
        }

        if (lineItems.some((li) => !li.unit)) {
          notifications.show({
            message: 'Nurodykite paslaugų ar prekių matą.',
            color: 'red',
          });
          return;
        }

        if (lineItems.some((li) => li.amount <= 0)) {
          notifications.show({
            message: 'Nurodykite teisingus paslaugų ar prekių kiekius.',
            color: 'red',
          });
          return;
        }

        if (lineItems.some((li) => !li.price)) {
          notifications.show({
            message: 'Nurodykite paslaugų ar prekių kainas.',
            color: 'red',
          });
          return;
        }

        if (inProcess.current) {
          return;
        }

        inProcess.current = true;

        const invoice: IInvoice = {
          invoiceType,
          seriesName,
          seriesId: parseInt(seriesId, 10),
          created,
          price: lineItems
            .map((g) => g.price * g.amount)
            .reduce((a, b) => a + b),
          buyer,
          email,
          seller,
          issuer,
          extra,
          language,
          lineItems,
          alreadyPaid,
          vat: lineItems
            .map(
              (g) =>
                (g.price - Math.round(g.price / (1.0 + g.vat / 100))) *
                g.amount,
            )
            .reduce((a, b) => a + b),
        };

        let response: Response;
        try {
          if (invoiceId) {
            response = await fetch('/api/invoices/' + invoiceId, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(invoice),
            });
          } else {
            response = await fetch('/api/invoices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                invoice,
                code,
              }),
            });
          }
        } catch {}

        const getEditError = () =>
          invoiceId
            ? 'Klaida kečiant sąskaitą faktūrą.'
            : 'Klaida kuriant sąskaitą faktūrą.';

        if (!response || !response.ok) {
          notifications.show({
            message: getEditError(),
            color: 'red',
          });
          inProcess.current = false;
          return;
        }

        const responseJson = await response.json();
        if (!responseJson.success) {
          notifications.show({
            message: getEditError(),
            color: 'red',
          });
          inProcess.current = false;
          return;
        }

        let responsePdf: Response;
        try {
          responsePdf = await fetch(
            '/api/invoicespdf/' + (invoiceId || responseJson.invoiceId),
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({}),
            },
          );
        } catch {}

        if (
          !responsePdf ||
          !responsePdf.ok ||
          !(await responsePdf.json()).success
        ) {
          notifications.show({
            message: 'Klaida generuojant sąskaitos faktūros PDF failą',
            color: 'red',
          });

          inProcess.current = false;
          return;
        }

        if (!invoiceId) {
          router.push(`/saskaitos/id/${responseJson.invoiceId}`);
        }

        if (!invoiceId) {
          notifications.show({
            message: 'Sąskaita faktūra sukurta',
            color: 'green',
          });
        } else {
          notifications.show({
            message: 'Sąskaitos faktūros pakeitimai išsaugoti',
            color: 'green',
          });
        }
        inProcess.current = false;
      }}
    >
      {invoiceId ? 'Saugoti' : 'Sukurti'}
    </Button>
  );
}
