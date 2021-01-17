import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

export default function Apie() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Privatumo politika
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ul>
          <li>
            {' '}
            Mes renkame šiuo duomenis:
            <ul>
              <li>IP adresas, data ir laikas, naršyklės informacija</li>
              <li>El. pašto adresas</li>
            </ul>
          </li>
          <li>
            Mes užtikriname, kad imamės pagrįstų techninių priemonių, kad
            apsaugotumėme surinktus duomenis.
          </li>
        </ul>
      </Grid>
    </Grid>
  );
}
