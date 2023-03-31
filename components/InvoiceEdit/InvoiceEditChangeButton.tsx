import { useRecoilState } from 'recoil';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import { useRouter } from 'next/router';

import { IInvoice } from '../../db/db';
import { getMsSinceEpoch } from '../../utils/date';

import {
  buyerState,
  emailState,
  extraState,
  invoiceDateState,
  invoiceIdState,
  invoiceTypeState,
  issuerState,
  languageState,
  lineItemsState,
  messageSeverityState,
  messageTextState,
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
              body: JSON.stringify(invoice),
            });
          }
        } catch {}

        const getEditError = () =>
          invoiceId
            ? 'Klaida kečiant sąskaitą faktūrą.'
            : 'Klaida kuriant sąskaitą faktūrą.';

        if (!response || !response.ok) {
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
          setMessageText('Klaida generuojant sąskaitos faktūros PDF failą');
          setMessageSeverity('error');
          return;
        }

        if (!invoiceId) {
          router.push(`/saskaitos/id/${responseJson.invoiceId}`);
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
