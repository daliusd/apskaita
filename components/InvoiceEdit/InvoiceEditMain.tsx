import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useSession } from 'next-auth/react';

import Link from '../../src/Link';
import LanguageSelect from './LanguageSelect';
import SeriesIdInput from './SeriesIdInput';
import BuyerEmailInput from '../inputs/BuyerEmailInput';
import SellerInput from './SellerInput';
import IssuerInput from './IssuerInput';
import ExtraInput from './ExtraInput';
import InvoiceEditDate from './InvoiceEditDate';
import InvoiceEditSeriesName from './InvoiceEditSeriesName';
import InvoiceEditBuyer from './InvoiceEditBuyer';
import { invoiceIdState } from '../../src/atoms';

export default function InvoiceEditMain() {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;
  const [invoiceId] = useRecoilState(invoiceIdState);

  return (
    <>
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
        <InvoiceEditSeriesName />
      </Grid>

      <Grid item xs={6}>
        <SeriesIdInput />
      </Grid>

      <Grid item xs={6}>
        <InvoiceEditDate />
      </Grid>

      <Grid item xs={6}>
        <LanguageSelect />
      </Grid>

      <Grid item xs={12}>
        <SellerInput />
      </Grid>

      <Grid item xs={12}>
        <InvoiceEditBuyer />
      </Grid>

      {gmailSend && (
        <Grid item xs={12}>
          <BuyerEmailInput />
        </Grid>
      )}

      <Grid item xs={12}>
        <IssuerInput />
      </Grid>

      <Grid item xs={12}>
        <ExtraInput />
      </Grid>
    </>
  );
}
