import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import useSWR from 'swr';
import { useSession } from 'next-auth/client';
import { useDebounce } from 'react-recipes';

import { ILineItem, IInvoice } from '../../db/db';
import LineItemEdit from '../../components/LineItemEdit';
import SeriesNameInput from '../../components/SeriesNameInput';
import SeriesIdInput from '../../components/SeriesIdInput';
import InvoiceDateInput from '../../components/InvoiceDateInput';
import BuyerInput from '../../components/BuyerInput';
import { getDateNumber } from '../../utils/date';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function InvoiceNew() {
  const [session] = useSession();

  const { data, error } = useSWR('/api/initial');
  const [seriesName, setSeriesName] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [buyer, setBuyer] = useState('');

  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    if (data) {
      setSeriesName(data.seriesName);
      setSeriesId(data.seriesId);
    }
  }, [data]);

  const debouncedSeriesName = useDebounce(seriesName, 500);

  const { data: seriesNamesData } = useSWR(
    `/api/uniqueseriesnames/${debouncedSeriesName}`,
  );

  const seriesIdResp = useSWR(
    debouncedSeriesName ? `/api/seriesid/${debouncedSeriesName}` : null,
  );

  useEffect(() => {
    if (seriesIdResp.data) {
      setSeriesId(seriesIdResp.data.seriesId);
    }
  }, [seriesIdResp.data]);

  const debouncedSeriesId = useDebounce(seriesId, 500);
  const { data: validSeriesNumberData } = useSWR(
    debouncedSeriesName && debouncedSeriesId
      ? `/api/validseriesnumber/${debouncedSeriesName}/${debouncedSeriesId}`
      : null,
  );

  const debouncedInvoiceDate = useDebounce(invoiceDate, 500);
  const { data: validInvoiceDate } = useSWR(
    debouncedSeriesName && debouncedSeriesId && debouncedInvoiceDate
      ? `/api/validcreateddate/${debouncedSeriesName}/${debouncedSeriesId}/${getDateNumber(
          debouncedInvoiceDate,
        )}`
      : null,
  );

  const [lineItems, setLineItems] = useState<ILineItem[]>([
    { id: 1, name: '', amount: 1, price: 0 },
  ]);

  if (!session) {
    return null;
  }

  if (error) return <div>failed to load</div>;
  if (!data) return <LinearProgress />;

  const handleErrorClose = () => {
    setErrorOpen(false);
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
          variant="contained"
          color="primary"
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

      <Grid item xs={12}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={async () => {
            const created = getDateNumber(invoiceDate);
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
            const response = await fetch('/api/invoices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(invoice),
            });

            if (!response.ok) {
              setErrorOpen(true);
              return;
            }

            const responseJson = await response.json();
            if (!responseJson.success) {
              setErrorOpen(true);
              return;
            }
            // TODO: kažką daryti su invoiceId
          }}
        >
          Sukurti
        </Button>
      </Grid>

      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
      >
        <Alert onClose={handleErrorClose} severity="error">
          Klaida kuriant sąskaitą faktūrą.
        </Alert>
      </Snackbar>
    </Grid>
  );
}
