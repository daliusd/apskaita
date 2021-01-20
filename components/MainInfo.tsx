import React from 'react';
import Link from '../src/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useSession } from 'next-auth/client';

import Invoices from '../components/Invoices';

export default function MainInfo() {
  const [session] = useSession();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        Esi prisijungęs/prisijungusi kaip {session.user.email}. Savo nustatymus
        galite pakeisti{' '}
        <Link href="/nustatymai" color="secondary">
          čia
        </Link>
        .
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Sąskaitos faktūros
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Invoices limit={5} />
      </Grid>
      <Grid item xs={12}>
        <Link href="/saskaitos" color="secondary">
          Visos sąskaitos faktūros
        </Link>
        &nbsp;&mdash;&nbsp;
        <Link href="/saskaitos/nauja" color="secondary">
          Nauja sąskaita faktūra
        </Link>
      </Grid>
    </Grid>
  );
}
