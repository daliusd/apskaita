import React from 'react';
import Grid from '@material-ui/core/Grid';

export default function IndexPageInfo() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        Individualios veiklos apskaita.
      </Grid>
      <Grid item xs={12}>
        Paprastai ir greitai galite padaryti šiuos dalykus:
        <ul>
          <li> Išrašyti sąskaitą </li>
          <li> Sugeneruoti PDF sąskaitas faktūras </li>
        </ul>
        Jums tereikia prisijungti su savo Google paskyra.
      </Grid>
      <Grid item xs={12}>
        Ateityje galėsite:
        <ul>
          <li> Išrašyti išankstines sąskaitas faktūras </li>
          <li> Sekti išlaidas </li>
          <li> Automatiškai suskaičiuoti mokesčius </li>
          <li> Peržiūrėti apskaitos žurnalą </li>
          <li> ... ir daugiau. </li>
        </ul>
      </Grid>
    </Grid>
  );
}
