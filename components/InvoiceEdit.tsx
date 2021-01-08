import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
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

  useEffect(() => {
    if (initialData) {
      setSeriesName(initialData.seriesName);
      setSeriesId(initialData.seriesId);
      setBuyer(initialData.buyer);
      setLineItems(initialData.lineItems);
      if (initialData.created) {
        setInvoiceDate(getDateFromMsSinceEpoch(initialData.created));
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
      debouncedSeriesName === initialData.seriesName
    ) {
      setSeriesId(initialData.seriesId);
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
    debouncedSeriesName && debouncedSeriesId && debouncedInvoiceDate
      ? `/api/validcreateddate/${debouncedSeriesName}/${debouncedSeriesId}/${getMsSinceEpoch(
          debouncedInvoiceDate,
        )}` + (invoiceId ? '?invoiceId=' + invoiceId : '')
      : null,
  );

  if (error) return <div>failed to load</div>;
  if (!initialData) return <LinearProgress />;

  const handleErrorClose = () => {
    setErrorText('');
  };

  return (
    <Grid container spacing={2}>
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
          valid={validSeriesNumberData ? validSeriesNumberData.valid : true}
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
              router.push(`/saskaitos/id/${responseJson.invoiceId}`);
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
        open={errorText}
        autoHideDuration={6000}
        onClose={handleErrorClose}
      >
        <Alert onClose={handleErrorClose} severity="error">
          {invoiceId
            ? 'Klaida kečiant sąskaitą faktūrą.'
            : 'Klaida kuriant sąskaitą faktūrą.'}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
