import React from 'react';
import Grid from '@material-ui/core/Grid';
import { useSession } from 'next-auth/client';

import Invoices from '../../components/Invoices';

export default function Index() {
  const [session] = useSession();

  if (!session) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Invoices />
      </Grid>
    </Grid>
  );
}
