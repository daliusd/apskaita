import React from 'react';
import Link from '../src/Link';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import Invoices from '../components/Invoices';
import ContactAgreement from '../components/ContactAgreement';

export default function MainInfo() {
  const [session] = useSession();
  const router = useRouter();

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Esi prisijungęs/prisijungusi kaip {session.user.email}. Savo
          nustatymus galite pakeisti{' '}
          <Link href="/nustatymai" color="secondary">
            čia
          </Link>
          .
        </Typography>
      </Grid>
      <ContactAgreement />
      <Grid item xs={12}>
        <Button
          aria-label="Nauja sąskaita faktūra"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onClickCreateInvoice}
        >
          Nauja sąskaita faktūra
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Paskutinės sąskaitos faktūros
        </Typography>
      </Grid>
      <Invoices limit={5} />
      <Grid item xs={12}>
        <Link href="/saskaitos" color="secondary">
          Visos sąskaitos faktūros
        </Link>
      </Grid>
    </Grid>
  );
}
