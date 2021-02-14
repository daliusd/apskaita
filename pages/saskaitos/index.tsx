import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import Invoices from '../../components/Invoices';

export default function Index() {
  const [session] = useSession();
  const router = useRouter();

  if (!session) {
    return null;
  }

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid container spacing={2}>
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
      <Invoices />
    </Grid>
  );
}
