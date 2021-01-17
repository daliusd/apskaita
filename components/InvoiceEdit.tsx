import React, { useEffect, useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { ILineItem, IInvoice } from '../db/db';
import LineItemEdit from '../components/LineItemEdit';
import SeriesNameInput from '../components/SeriesNameInput';
import SeriesIdInput from '../components/SeriesIdInput';
import InvoiceDateInput from '../components/InvoiceDateInput';
import BuyerInput from '../components/BuyerInput';
import SellerInput from '../components/SellerInput';
import IssuerInput from '../components/IssuerInput';
import ExtraInput from '../components/ExtraInput';
import { getDateFromMsSinceEpoch, getMsSinceEpoch } from '../utils/date';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
}

export default function InvoiceEdit({ invoiceId }: IProps) {
  const router = useRouter();
  const { dispatch } = useContext<IContext>(Context);

  const { data: initialData, error } = useSWR(
    '/api/initial' + (invoiceId ? '?id=' + invoiceId : ''),
  );
  const [seriesName, setSeriesName] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [seller, setSeller] = useState('');
  const [buyer, setBuyer] = useState('');
  const [issuer, setIssuer] = useState('');
  const [extra, setExtra] = useState('');
  const [lineItems, setLineItems] = useState<ILineItem[]>([
    { id: 0, name: '', unit: 'vnt.', amount: 1, price: 0 },
  ]);

  useEffect(() => {
    if (initialData && initialData.invoice) {
      const { invoice } = initialData;
      setSeriesName(invoice.seriesName);
      setSeriesId(invoice.seriesId);
      setSeller(invoice.seller);
      setBuyer(invoice.buyer);
      setIssuer(invoice.issuer);
      setExtra(invoice.extra);
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
        <SellerInput seller={seller} onChange={setSeller} />
      </Grid>

      <Grid item xs={12}>
        <BuyerInput buyer={buyer} onChange={setBuyer} />
      </Grid>

      <Grid item xs={12}>
        <IssuerInput issuer={issuer} onChange={setIssuer} />
      </Grid>

      <Grid item xs={12}>
        <ExtraInput extra={extra} onChange={setExtra} />
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
                unit: 'vnt.',
                amount: 1,
                price: 0,
              },
            ]);
          }}
        >
          Pridėti paslaugą
        </Button>
      </Grid>

      <Grid item xs={4}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={invoiceId ? <SaveIcon /> : <AddIcon />}
          onClick={async () => {
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

            if (!invoiceId) {
              router.push(`/saskaitos/id/${responseJson.invoiceId}`);
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
      </Grid>

      {invoiceId && (
        <Grid container item xs={4} justify="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => {
              router.push('/api/pdf/' + invoiceId);
            }}
          >
            PDF failas
          </Button>
        </Grid>
      )}

      {invoiceId && (
        <Grid container item xs={4} justify="flex-end">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon />}
            onClick={async () => {
              const response = await fetch('/api/invoices/' + invoiceId, {
                method: 'DELETE',
              });

              if (!response.ok || !(await response.json()).success) {
                dispatch({
                  type: 'SET_MESSAGE',
                  text: 'Klaida trinant sąskaitą faktūrą.',
                  severity: 'error',
                });
                return;
              }

              router.replace(`/saskaitos`);
            }}
          >
            Trinti
          </Button>
        </Grid>
      )}
    </Grid>
  );
}
