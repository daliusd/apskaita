import React from 'react';
import { useRecoilState } from 'recoil';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import { useRouter } from 'next/router';

import { IInvoice, ILineItem } from '../db/db';
import { getMsSinceEpoch } from '../utils/date';

import { messageSeverityState, messageTextState } from '../src/atoms';

interface IProps {
  invoiceId?: string;
  seriesName: string;
  seriesId: string;
  invoiceDate: Date;
  seller: string;
  buyer: string;
  email: string;
  issuer: string;
  extra: string;
  language: string;
  lineItems: ILineItem[];
}

export default function InvoiceEditChangeButton({
  invoiceId,
  seriesName,
  seriesId,
  invoiceDate,
  seller,
  buyer,
  email,
  issuer,
  extra,
  language,
  lineItems,
}: IProps) {
  const router = useRouter();
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  return (
    <Button
      type="submit"
      aria-label={invoiceId ? 'Saugoti' : 'Sukurti'}
      variant="contained"
      color="primary"
      startIcon={invoiceId ? <SaveIcon /> : <AddIcon />}
      onClick={async () => {
        if (!seriesName) {
          setMessageText('Nurodykite serijos pavadinimą.');
          setMessageSeverity('error');
          return;
        }

        const created = getMsSinceEpoch(invoiceDate);
        if (!created) {
          setMessageText('Nurodykite sąskaitos datą.');
          setMessageSeverity('error');
          return;
        }

        if (!seller) {
          setMessageText('Nurodykite pardavėjo duomenis.');
          setMessageSeverity('error');
          return;
        }

        if (!buyer) {
          setMessageText('Nurodykite pirkėjo duomenis.');
          setMessageSeverity('error');
          return;
        }

        if (!issuer) {
          setMessageText('Nurodykite kas išrašė sąskaitą faktūrą.');
          setMessageSeverity('error');
          return;
        }

        if (lineItems.some((li) => !li.name)) {
          setMessageText('Nurodykite paslaugų ar prekių pavadinimus.');
          setMessageSeverity('error');
          return;
        }

        if (lineItems.some((li) => !li.unit)) {
          setMessageText('Nurodykite paslaugų ar prekių matą.');
          setMessageSeverity('error');
          return;
        }

        if (lineItems.some((li) => li.amount <= 0)) {
          setMessageText('Nurodykite teisingus paslaugų ar prekių kiekius.');
          setMessageSeverity('error');
          return;
        }

        if (lineItems.some((li) => !li.price)) {
          setMessageText('Nurodykite paslaugų ar prekių kainas.');
          setMessageSeverity('error');
          return;
        }

        const invoice: IInvoice = {
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
        };

        let response: Response;
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
            body: JSON.stringify(invoice),
          });
        }

        const getEditError = () =>
          invoiceId
            ? 'Klaida kečiant sąskaitą faktūrą.'
            : 'Klaida kuriant sąskaitą faktūrą.';

        if (!response.ok) {
          setMessageText(getEditError());
          setMessageSeverity('error');
          return;
        }

        const responseJson = await response.json();
        if (!responseJson.success) {
          setMessageText(getEditError());
          setMessageSeverity('error');
          return;
        }

        const responsePdf = await fetch(
          '/api/invoicespdf/' + (invoiceId || responseJson.invoiceId),
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          },
        );

        if (!invoiceId) {
          router.push(`/saskaitos/id/${responseJson.invoiceId}`);
        }

        if (!responsePdf.ok || !(await responsePdf.json()).success) {
          setMessageText('Klaida generuojant sąskaitos faktūros PDF failą');
          setMessageSeverity('error');
          return;
        }

        if (!invoiceId) {
          setMessageText('Sąskaita faktūra sukurta');
          setMessageSeverity('success');
        } else {
          setMessageText('Sąskaitos faktūros pakeitimai išsaugoti');
          setMessageSeverity('success');
        }
      }}
    >
      {invoiceId ? 'Saugoti' : 'Sukurti'}
    </Button>
  );
}
