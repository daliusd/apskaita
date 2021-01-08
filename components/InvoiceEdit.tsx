import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { ILineItem, IInvoice } from '../db/db';
import LineItemEdit from '../components/LineItemEdit';
import SeriesNameInput from '../components/SeriesNameInput';
import SeriesIdInput from '../components/SeriesIdInput';
import InvoiceDateInput from '../components/InvoiceDateInput';
import BuyerInput from '../components/BuyerInput';
import { getDateFromMsSinceEpoch, getMsSinceEpoch } from '../utils/date';

interface IProps {
  invoiceId?: string;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function InvoiceEdit({ invoiceId }: IProps) {
  const router = useRouter();

  const { data: initialData, error } = useSWR(
    '/api/initial' + (invoiceId ? '?id=' + invoiceId : ''),
  );
  const [seriesName, setSeriesName] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [buyer, setBuyer] = useState('');
  const [lineItems, setLineItems] = useState<ILineItem[]>([
    { id: 1, name: '', amount: 1, price: 0 },
  ]);

  const [errorText, setErrorText] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (initialData && initialData.invoice) {
      const { invoice } = initialData;
      setSeriesName(invoice.seriesName);
      setSeriesId(invoice.seriesId);
      setBuyer(invoice.buyer);
      setLineItems(invoice.lineItems);
      if (invoice.created) {
        setInvoiceDate(getDateFromMsSinceEpoch(invoice.created));
      }
    }
  }, [initialData]);

  const debouncedSeriesName = useDebounce(seriesName, 500);

  const { data: seriesNamesData } = useSWR(
    `/api/uniqueseriesnames/${debouncedSeriesName}`,
  );

  const seriesIdResp = useSWR(
    debouncedSeriesName ? `/api/seriesid/${debouncedSeriesName}` : null,
  );

  useEffect(() => {
    if (
      invoiceId &&
      initialData &&
      initialData.invoice &&
      debouncedSeriesName === initialData.invoice.seriesName
    ) {
      setSeriesId(initialData.invoice.seriesId);
    } else if (seriesIdResp.data) {
      setSeriesId(seriesIdResp.data.seriesId);
    }
  }, [seriesIdResp.data, debouncedSeriesName, initialData, invoiceId]);

  const debouncedSeriesId = useDebounce(seriesId, 500);
  const { data: validSeriesNumberData } = useSWR(
    debouncedSeriesName && debouncedSeriesId
      ? `/api/validseriesnumber/${debouncedSeriesName}/${debouncedSeriesId}` +
          (invoiceId ? '?invoiceId=' + invoiceId : '')
      : null,
  );

  const debouncedInvoiceDate = useDebounce(invoiceDate, 500);
  const { data: validInvoiceDate } = useSWR(
    debouncedSeriesName &&
      debouncedSeriesId &&
      debouncedInvoiceDate &&
      getMsSinceEpoch(debouncedInvoiceDate)
      ? `/api/validcreateddate/${debouncedSeriesName}/${debouncedSeriesId}/${getMsSinceEpoch(
          debouncedInvoiceDate,
        )}` + (invoiceId ? '?invoiceId=' + invoiceId : '')
      : null,
  );

  if (error) return <div>failed to load</div>;
  if (!initialData) return <LinearProgress />;
  if (!initialData.invoice) return <span>Sąskaita faktūra neegzistuoja.</span>;

  const handleErrorClose = () => {
    setErrorText('');
  };

  const handleMessageClose = () => {
    setMessageText('');
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">
          {invoiceId ? 'Keisti sąskaitą faktūrą' : 'Sukurti sąskaitą faktūrą'}
        </Typography>
      </Grid>

      <Grid item xs={6}>
        <SeriesNameInput
          seriesName={seriesName}
          onChange={setSeriesName}
          options={seriesNamesData ? seriesNamesData.seriesNames : []}
        />
      </Grid>

      <Grid item xs={6}>
        <SeriesIdInput
          seriesId={seriesId}
          onChange={setSeriesId}
          valid={validSeriesNumberData ? validSeriesNumberData.valid : false}
        />
      </Grid>

      <Grid item xs={12}>
        <InvoiceDateInput
          date={invoiceDate}
          onChange={setInvoiceDate}
          validInvoiceDate={validInvoiceDate}
        />
      </Grid>

      <Grid item xs={12}>
        <BuyerInput buyer={buyer} onChange={setBuyer} />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6">Paslaugos ar prekės</Typography>
      </Grid>

      {lineItems.map((g) => {
        return (
          <LineItemEdit
            key={g.id}
            lineItem={g}
            deleteEnabled={lineItems.length > 1}
            onDelete={() => {
              setLineItems(lineItems.filter((gt) => gt.id != g.id));
            }}
            onChange={(gn) => {
              setLineItems(
                lineItems.map((g) => {
                  if (gn.id != g.id) {
                    return g;
                  }
                  return gn;
                }),
              );
            }}
          />
        );
      })}

      <Grid item xs={12}>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setLineItems([
              ...lineItems,
              {
                id: Math.max(...lineItems.map((g) => g.id)) + 1,
                name: '',
                amount: 1,
                price: 0,
              },
            ]);
          }}
        >
          Pridėti paslaugą
        </Button>
      </Grid>

      <Grid item xs={6}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={async () => {
            const created = getMsSinceEpoch(invoiceDate);
            if (!created) {
              setErrorText('Nurodykite sąskaitos datą.');
              return;
            }

            if (!buyer) {
              setErrorText('Nurodykite pirkėjo informaciją.');
              return;
            }

            if (lineItems.some((li) => !li.name)) {
              setErrorText('Nurodykite paslaugų ar prekių pavadinimus.');
              return;
            }

            if (lineItems.some((li) => li.amount <= 0)) {
              setErrorText('Nurodykite teisingus paslaugų ar prekių kiekius.');
              return;
            }

            if (lineItems.some((li) => !li.price)) {
              setErrorText('Nurodykite paslaugų ar prekių kainas.');
              return;
            }

            console.log(lineItems);
            const invoice: IInvoice = {
              seriesName,
              seriesId: parseInt(seriesId, 10),
              created,
              price: lineItems
                .map((g) => g.price * g.amount)
                .reduce((a, b) => a + b),
              buyer,
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
              setErrorText(getEditError());
              return;
            }

            const responseJson = await response.json();
            if (!responseJson.success) {
              setErrorText(getEditError());
              return;
            }

            if (!invoiceId) {
              router.push(`/`);
            } else {
              setMessageText('Sąskaita faktūra pakeista');
            }
          }}
        >
          {invoiceId ? 'Keisti' : 'Sukurti'}
        </Button>
      </Grid>

      {invoiceId && (
        <Grid container item xs={6} justify="flex-end">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={async () => {
              console.log('hi');
              const response = await fetch('/api/invoices/' + invoiceId, {
                method: 'DELETE',
              });

              if (!response.ok || !(await response.json()).success) {
                setErrorText('Klaida trinant sąskaitą faktūrą.');
                return;
              }

              router.replace(`/saskaitos`);
            }}
          >
            Trinti
          </Button>
        </Grid>
      )}

      <Snackbar
        open={!!errorText}
        autoHideDuration={6000}
        onClose={handleErrorClose}
      >
        <Alert onClose={handleErrorClose} severity="error">
          {errorText}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!messageText}
        autoHideDuration={6000}
        onClose={handleMessageClose}
      >
        <Alert onClose={handleMessageClose} severity="success">
          {messageText}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
