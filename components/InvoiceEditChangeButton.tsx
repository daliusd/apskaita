import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import { useRouter } from 'next/router';

import { IInvoice, ILineItem } from '../db/db';
import { getMsSinceEpoch } from '../utils/date';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  seriesName: string;
  seriesId: string;
  invoiceDate: Date;
  seller: string;
  buyer: string;
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
  issuer,
  extra,
  language,
  lineItems,
}: IProps) {
  const router = useRouter();
  const { dispatch } = useContext<IContext>(Context);

  return (
    <Button
      type="submit"
      aria-label={invoiceId ? 'Saugoti' : 'Sukurti'}
      variant="contained"
      color="primary"
      startIcon={invoiceId ? <SaveIcon /> : <AddIcon />}
      onClick={async () => {
        if (!seriesName) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite serijos pavadinimą.',
            severity: 'error',
          });
          return;
        }

        const created = getMsSinceEpoch(invoiceDate);
        if (!created) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite sąskaitos datą.',
            severity: 'error',
          });
          return;
        }

        if (!seller) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite pardavėjo duomenis.',
            severity: 'error',
          });
          return;
        }

        if (!buyer) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite pirkėjo duomenis.',
            severity: 'error',
          });
          return;
        }

        if (!issuer) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite kas išrašė sąskaitą faktūrą.',
            severity: 'error',
          });
          return;
        }

        if (lineItems.some((li) => !li.name)) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite paslaugų ar prekių pavadinimus.',
            severity: 'error',
          });
          return;
        }

        if (lineItems.some((li) => !li.unit)) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite paslaugų ar prekių matą.',
            severity: 'error',
          });
          return;
        }

        if (lineItems.some((li) => li.amount <= 0)) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite teisingus paslaugų ar prekių kiekius.',
            severity: 'error',
          });
          return;
        }

        if (lineItems.some((li) => !li.price)) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Nurodykite paslaugų ar prekių kainas.',
            severity: 'error',
          });
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
          seller,
          issuer,
          extra,
          language,
          lineItems,
        };

        let response;
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
          dispatch({
            type: 'SET_MESSAGE',
            text: getEditError(),
            severity: 'error',
          });
          return;
        }

        const responseJson = await response.json();
        if (!responseJson.success) {
          dispatch({
            type: 'SET_MESSAGE',
            text: getEditError(),
            severity: 'error',
          });
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
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Klaida generuojant sąskaitos faktūros PDF failą',
            severity: 'error',
          });
          return;
        }

        if (!invoiceId) {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Sąskaita faktūra sukurta',
            severity: 'success',
          });
        } else {
          dispatch({
            type: 'SET_MESSAGE',
            text: 'Sąskaitos faktūros pakeitimai išsaugoti',
            severity: 'success',
          });
        }
      }}
    >
      {invoiceId ? 'Saugoti' : 'Sukurti'}
    </Button>
  );
}
