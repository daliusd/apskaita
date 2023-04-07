import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';

import BuyerEmailInput from '../inputs/BuyerEmailInput';
import ExtraInput from './ExtraInput';
import InvoiceEditBuyer from './InvoiceEditBuyer';
import InvoiceEditDate from './InvoiceEditDate';
import InvoiceEditSeriesName from './InvoiceEditSeriesName';
import InvoiceEditType from './InvoiceEditType';
import IssuerInput from './IssuerInput';
import LanguageSelect from './LanguageSelect';
import Link from '../../src/Link';
import SellerInput from './SellerInput';
import SeriesIdInput from './SeriesIdInput';
import { invoiceIdState } from '../../src/atoms';

export default function InvoiceEditMain() {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;
  const [invoiceId] = useRecoilState(invoiceIdState);

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

      <Grid item xs={12}>
        <InvoiceEditType />
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
    </Grid>
  );
}
