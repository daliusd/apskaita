import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import { ILineItem } from '../db/db';
import LineItemEdit from '../components/LineItemEdit';
import LanguageSelect from '../components/LanguageSelect';
import SeriesNameInput from '../components/SeriesNameInput';
import SeriesIdInput from '../components/SeriesIdInput';
import InvoiceDateInput from '../components/InvoiceDateInput';
import BuyerInput from '../components/BuyerInput';
import SellerInput from '../components/SellerInput';
import IssuerInput from '../components/IssuerInput';
import ExtraInput from '../components/ExtraInput';
import InvoiceEditChangeButton from './InvoiceEditChangeButton';
import InvoiceEditDeleteButton from './InvoiceEditDeleteButton';
import InvoiceEditPaid from './InvoiceEditPaid';
import InvoiceEditLocked from './InvoiceEditLocked';
import InvoicePdfView from './InvoicePdfView';
import { getDateFromMsSinceEpoch, getMsSinceEpoch } from '../utils/date';

interface IProps {
  invoiceId?: string;
  sourceId?: string;
}

export default function InvoiceEdit({ invoiceId, sourceId }: IProps) {
  const [language, setLanguage] = useState('lt');
  const [languageAfterChange, setLanguageAfterChange] = useState(null);

  const { data: initialData, error } = useSWR(
    '/api/initial' +
      (invoiceId ? '?id=' + invoiceId : '') +
      (sourceId ? '?sourceId=' + sourceId : ''),
  );
  const [seriesName, setSeriesName] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [seller, setSeller] = useState('');
  const [buyer, setBuyer] = useState('');
  const [issuer, setIssuer] = useState('');
  const [extra, setExtra] = useState('');
  const [pdfname, setPdfname] = useState('');
  const [paid, setPaid] = useState(false);
  const [locked, setLocked] = useState(false);
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
      setLanguage(invoice.language);
      setPdfname(invoice.pdfname);
      setLineItems(invoice.lineItems);
      setPaid(invoice.paid === 1);
      setLocked(invoice.locked === 1);
      if (invoice.created) {
        setInvoiceDate(getDateFromMsSinceEpoch(invoice.created));
      }
    }
  }, [initialData]);

  const debouncedSeriesName = useDebounce(seriesName, 500);

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

  const languageSettingPlus = languageAfterChange === 'en' ? '_en' : '';

  const { data: sellerData } = useSWR(
    languageAfterChange && `/api/settings/seller${languageSettingPlus}`,
  );
  useEffect(() => {
    if (sellerData && sellerData.value) {
      setSeller(sellerData.value);
    }
  }, [sellerData]);

  const { data: issuerData } = useSWR(
    languageAfterChange && `/api/settings/issuer${languageSettingPlus}`,
  );
  useEffect(() => {
    if (issuerData && issuerData.value) {
      setIssuer(issuerData.value);
    }
  }, [issuerData]);

  const { data: extraData } = useSWR(
    languageAfterChange && `/api/settings/extra${languageSettingPlus}`,
  );
  useEffect(() => {
    if (extraData && extraData.value) {
      setExtra(extraData.value);
    }
  }, [extraData]);

  if (error) return <div>Klaida atsisiunčiant sąskaita.</div>;
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
          disabled={locked}
          valid={seriesName.length > 0}
        />
      </Grid>

      <Grid item xs={6}>
        <SeriesIdInput
          seriesId={seriesId}
          onChange={setSeriesId}
          valid={validSeriesNumberData ? validSeriesNumberData.valid : true}
          disabled={(!seriesIdResp.data && !seriesIdResp.error) || locked}
        />
      </Grid>

      <Grid item xs={6}>
        <InvoiceDateInput
          date={invoiceDate}
          onChange={setInvoiceDate}
          validInvoiceDate={validInvoiceDate}
          disabled={locked}
        />
      </Grid>

      <Grid item xs={6}>
        <LanguageSelect
          language={language}
          onChange={(l) => {
            setLanguage(l);
            setLanguageAfterChange(l);
          }}
          disabled={locked}
        />
      </Grid>

      <Grid item xs={12}>
        <SellerInput
          seller={seller}
          onChange={setSeller}
          disabled={locked || (languageAfterChange && !sellerData)}
        />
      </Grid>

      <Grid item xs={12}>
        <BuyerInput buyer={buyer} onChange={setBuyer} disabled={locked} />
      </Grid>

      <Grid item xs={12}>
        <IssuerInput
          issuer={issuer}
          onChange={setIssuer}
          disabled={locked || (languageAfterChange && !issuerData)}
        />
      </Grid>

      <Grid item xs={12}>
        <ExtraInput
          extra={extra}
          onChange={setExtra}
          disabled={locked || (languageAfterChange && !extraData)}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6">Paslaugos ar prekės</Typography>
      </Grid>

      {lineItems.map((g, idx) => {
        return (
          <LineItemEdit
            key={g.id}
            idx={idx}
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
            disabled={locked}
          />
        );
      })}

      <Grid item xs={12}>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          aria-label="Pridėti paslaugą ar prekę"
          disabled={locked}
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
          Pridėti paslaugą ar prekę
        </Button>
      </Grid>

      <Grid item xs={12}>
        <InvoiceEditChangeButton
          invoiceId={invoiceId}
          seriesName={seriesName}
          seriesId={seriesId}
          invoiceDate={invoiceDate}
          seller={seller}
          buyer={buyer}
          issuer={issuer}
          extra={extra}
          language={language}
          lineItems={lineItems}
        />
      </Grid>

      <InvoicePdfView
        seriesName={seriesName}
        seriesId={seriesId}
        pdfname={pdfname}
      />

      <InvoiceEditPaid invoiceId={invoiceId} paid={paid} setPaid={setPaid} />
      <InvoiceEditLocked
        invoiceId={invoiceId}
        locked={locked}
        setLocked={setLocked}
        withHelperText={true}
      />

      <InvoiceEditDeleteButton invoiceId={invoiceId} disabled={locked} />
    </Grid>
  );
}
