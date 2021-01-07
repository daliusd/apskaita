import React from 'react';
import Link from '../src/Link';
import Grid from '@material-ui/core/Grid';
import { useSession } from 'next-auth/client';

import LastInvoices from '../components/LastInvoices';

export default function Index() {
  const [session] = useSession();

  if (!session) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        Esi prisijungęs/prisijungusi kaip {session.user.email}.
      </Grid>
      <LastInvoices />
      <Grid item xs={12}>
        <Link href="/saskaitos/nauja" color="secondary">
          Nauja sąskaita faktūra
        </Link>
      </Grid>
    </Grid>
  );
}
