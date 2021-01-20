import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import SellerInfoEdit from '../components/SellerInfoEdit';
import IssuerEdit from '../components/IssuerEdit';
import ExtraEdit from '../components/ExtraEdit';
import ZeroesEdit from '../components/ZeroesEdit';

export default function Apie() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Nustatymai
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <SellerInfoEdit />
      </Grid>
      <Grid item xs={12}>
        <IssuerEdit />
      </Grid>
      <Grid item xs={12}>
        <ExtraEdit />
      </Grid>
      <Grid item xs={12}>
        <ZeroesEdit />
      </Grid>
    </Grid>
  );
}
