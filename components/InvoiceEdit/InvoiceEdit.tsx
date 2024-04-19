import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Loader } from '@mantine/core';
import useSWR from 'swr';

import InvoiceEditHeader from './InvoiceEditHeader';
import InvoiceEditMain from './InvoiceEditMain';
import InvoiceEditItems from './InvoiceEditItems';
import InvoiceEditControls from './InvoiceEditControls';
import { getDateFromMsSinceEpoch } from '../../utils/date';
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
  languageAfterChangeState,
  invoiceTypeState,
  alreadyPaidState,
} from '../../src/atoms';

interface IProps {
  invoiceId?: string;
  sourceId?: string;
  invoiceType?: string;
}

export default function InvoiceEdit({
  invoiceId,
  sourceId,
  invoiceType,
}: IProps) {
  const [, setLanguage] = useRecoilState(languageState);
  const [, setLanguageAfterChange] = useRecoilState(languageAfterChangeState);

  const { data: initialData, error } = useSWR(
    '/api/initial' +
      (invoiceId ? '?id=' + invoiceId : '') +
      (sourceId
        ? '?sourceId=' +
          sourceId +
          (invoiceType ? '&invoiceType=' + invoiceType : '')
        : ''),
  );
  const [, setInitialInvoice] = useRecoilState(initialInvoiceState);
  const [, setInvoiceId] = useRecoilState(invoiceIdState);
  const [, setInvoiceType] = useRecoilState(invoiceTypeState);
  const [, setSeriesName] = useRecoilState(seriesNameState);
  const [, setSeriesId] = useRecoilState(seriesIdState);
  const [, setInvoiceDate] = useRecoilState(invoiceDateState);
  const [, setSeller] = useRecoilState(sellerState);
  const [, setBuyer] = useRecoilState(buyerState);
  const [, setEmail] = useRecoilState(emailState);
  const [, setIssuer] = useRecoilState(issuerState);
  const [, setExtra] = useRecoilState(extraState);
  const [, setAlreadyPaid] = useRecoilState(alreadyPaidState);
  const [, setPdfname] = useRecoilState(pdfnameState);
  const [, setPaid] = useRecoilState(paidState);
  const [, setLocked] = useRecoilState(lockedState);
  const [, setSent] = useRecoilState(sentState);
  const [, setLineItems] = useRecoilState(lineItemsState);

  useEffect(() => {
    if (initialData && initialData.invoice) {
      const { invoice } = initialData;
      setInitialInvoice(invoice);
      setInvoiceId(invoice.id);
      setInvoiceType(invoice.invoiceType);
      setSeriesName(invoice.seriesName);
      setSeriesId(invoice.seriesId);
      setSeller(invoice.seller);
      setBuyer(invoice.buyer);
      setEmail(invoice.email);
      setIssuer(invoice.issuer);
      setExtra(invoice.extra);
      setAlreadyPaid(invoice.alreadyPaid || 0);
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
      setLanguageAfterChange(null);
    }
  }, [
    initialData,
    setInitialInvoice,
    setInvoiceId,
    setLanguage,
    setBuyer,
    setEmail,
    setExtra,
    setAlreadyPaid,
    setInvoiceDate,
    setIssuer,
    setLineItems,
    setLocked,
    setPaid,
    setPdfname,
    setSeller,
    setSent,
    setSeriesId,
    setInvoiceType,
    setSeriesName,
    setLanguageAfterChange,
  ]);

  if (error) return <div>Klaida atsisiunčiant sąskaita.</div>;
  if (!initialData) return <Loader />;
  if (!initialData.invoice) return <span>Sąskaita faktūra neegzistuoja.</span>;

  return (
    <Grid gutter={{ base: 24 }}>
      <Grid.Col span={{ base: 12 }}>
        <Grid gutter={{ base: 24 }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <InvoiceEditHeader />
          </Grid.Col>
        </Grid>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <InvoiceEditMain />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 48 }}>
          <Grid.Col span={{ base: 12 }}>
            <InvoiceEditItems />
          </Grid.Col>
          <Grid.Col span={{ base: 12 }}>
            <InvoiceEditControls />
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
