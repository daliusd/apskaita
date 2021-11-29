import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';
import { useDebounce } from 'react-recipes';

import Link from '../src/Link';
import LineItemEdit from '../components/LineItemEdit';
import LanguageSelect from '../components/LanguageSelect';
import SeriesNameInput from '../components/SeriesNameInput';
import SeriesIdInput from '../components/SeriesIdInput';
import InvoiceDateInput from '../components/InvoiceDateInput';
import BuyerInput from '../components/BuyerInput';
import EmailInput from '../components/EmailInput';
import SellerInput from '../components/SellerInput';
import IssuerInput from '../components/IssuerInput';
import ExtraInput from '../components/ExtraInput';
import InvoiceEditChangeButton from './InvoiceEditChangeButton';
import InvoiceEditDeleteButton from './InvoiceEditDeleteButton';
import InvoiceEditPaid from './InvoiceEditPaid';
import InvoiceEditLocked from './InvoiceEditLocked';
import InvoiceEditSent from './InvoiceEditSent';
import SendInvoiceButton from './SendInvoiceButton';
import InvoicePdfView from './InvoicePdfView';
import { getDateFromMsSinceEpoch, getMsSinceEpoch } from '../utils/date';
import {
  invoiceIdState,
  seriesNameState,
  seriesIdState,
  invoiceDateState,
  sellerState,
  buyerState,
  emailState,
  issuerState,
  extraState,
  pdfnameState,
  paidState,
  lockedState,
  sentState,
  lineItemsState,
  languageState,
  initialInvoiceState,
} from '../src/atoms';

interface IProps {
  invoiceId?: string;
  sourceId?: string;
}

export default function InvoiceEdit({ invoiceId, sourceId }: IProps) {
  const [session] = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;

  const [language, setLanguage] = useRecoilState(languageState);
  const [languageAfterChange, setLanguageAfterChange] = useState(null);

  const { data: initialData, error } = useSWR(
    '/api/initial' +
      (invoiceId ? '?id=' + invoiceId : '') +
      (sourceId ? '?sourceId=' + sourceId : ''),
  );
  const [, setInitialInvoice] = useRecoilState(initialInvoiceState);
  const [, setInvoiceId] = useRecoilState(invoiceIdState);
  const [seriesName, setSeriesName] = useRecoilState(seriesNameState);
  const [seriesId, setSeriesId] = useRecoilState(seriesIdState);
  const [invoiceDate, setInvoiceDate] = useRecoilState(invoiceDateState);
  const [seller, setSeller] = useRecoilState(sellerState);
  const [buyer, setBuyer] = useRecoilState(buyerState);
  const [email, setEmail] = useRecoilState(emailState);
  const [issuer, setIssuer] = useRecoilState(issuerState);
  const [extra, setExtra] = useRecoilState(extraState);
  const [pdfname, setPdfname] = useRecoilState(pdfnameState);
  const [paid, setPaid] = useRecoilState(paidState);
  const [locked, setLocked] = useRecoilState(lockedState);
  const [sent, setSent] = useRecoilState(sentState);
  const [lineItems, setLineItems] = useRecoilState(lineItemsState);

  useEffect(() => {
    if (initialData && initialData.invoice) {
      const { invoice } = initialData;
      setInitialInvoice(invoice);
      setInvoiceId(invoice.id);
      setSeriesName(invoice.seriesName);
      setSeriesId(invoice.seriesId);
      setSeller(invoice.seller);
      setBuyer(invoice.buyer);
      setEmail(invoice.email);
      setIssuer(invoice.issuer);
      setExtra(invoice.extra);
      setLanguage(invoice.language);
      setPdfname(invoice.pdfname);
      setLineItems(invoice.lineItems);
      setPaid(invoice.paid === 1);
      setLocked(invoice.locked === 1);
      setSent(invoice.sent === 1);
      if (invoice.created) {
        setInvoiceDate(getDateFromMsSinceEpoch(invoice.created));
      } else {
        setInvoiceDate(new Date());
      }
    } else {
      setLineItems([]);
    }
  }, [
    initialData,
    setInitialInvoice,
    setInvoiceId,
    setLanguage,
    setBuyer,
    setEmail,
    setExtra,
    setInvoiceDate,
    setIssuer,
    setLineItems,
    setLocked,
    setPaid,
    setPdfname,
    setSeller,
    setSent,
    setSeriesId,
    setSeriesName,
  ]);

  const debouncedSeriesName = useDebounce(seriesName, 500);

  const debouncedSeriesId = useDebounce(seriesId, 500);

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
  }, [sellerData, setSeller]);

  const { data: issuerData } = useSWR(
    languageAfterChange && `/api/settings/issuer${languageSettingPlus}`,
  );
  useEffect(() => {
    if (issuerData && issuerData.value) {
      setIssuer(issuerData.value);
    }
  }, [issuerData, setIssuer]);

  const { data: extraData } = useSWR(
    languageAfterChange && `/api/settings/extra${languageSettingPlus}`,
  );
  useEffect(() => {
    if (extraData && extraData.value) {
      setExtra(extraData.value);
    }
  }, [extraData, setExtra]);

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

      <Grid item xs={12}>
        <Typography variant="body2" component="div">
          Pagalbinės informacijos apie sąskaitų faktūrų sukūrimą, keitimą ir
          kitą funkcionalumą galite rasti šiame straipsnyje{' '}
          <Link href="/straipsniai/saskaitos-fakturos">
            „Sąskaitų faktūrų išrašymas ir redagavimas“
          </Link>
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
        <SeriesIdInput />
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
        <BuyerInput
          buyer={buyer}
          onChange={(buyerInfo) => {
            setBuyer(buyerInfo.buyer);
            if (!email) {
              setEmail(buyerInfo.email);
            }
          }}
          disabled={locked}
        />
      </Grid>

      {gmailSend && (
        <Grid item xs={12}>
          <EmailInput email={email} onChange={setEmail} disabled={locked} />
        </Grid>
      )}

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
          email={email}
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

      {!!invoiceId && (
        <Grid item xs={12}>
          <Typography variant="body1" color="textSecondary" component="p">
            Ši sąskaita faktūra yra:
          </Typography>
        </Grid>
      )}

      {!!invoiceId !== null && (
        <Grid item xs={12}>
          <InvoiceEditPaid
            invoiceId={invoiceId}
            paid={paid}
            setPaid={setPaid}
          />
          <InvoiceEditLocked
            invoiceId={invoiceId}
            locked={locked}
            setLocked={setLocked}
          />
          <InvoiceEditSent
            invoiceId={invoiceId}
            sent={sent}
            setSent={setSent}
          />
        </Grid>
      )}

      {gmailSend && (
        <SendInvoiceButton
          invoiceId={invoiceId}
          email={email}
          onSent={() => {
            setSent(true);
            setLocked(true);
          }}
          disabled={!email || sent}
        />
      )}

      <InvoiceEditDeleteButton invoiceId={invoiceId} disabled={locked} />
    </Grid>
  );
}
