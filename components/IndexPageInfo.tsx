import React from 'react';
import Grid from '@material-ui/core/Grid';
import Head from 'next/head';

export default function IndexPageInfo() {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Individualios veiklos apskaita: paprastai ir greitai išrašykite sąskaitas, sugeneruokite PDF failus ir sekite išlaidas."
        />
      </Head>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          Individualios veiklos apskaita.
        </Grid>
        <Grid item xs={12}>
          Paprastai ir greitai galite padaryti šiuos dalykus:
          <ul>
            <li> Išrašyti sąskaitąs </li>
            <li> Sugeneruoti PDF failus </li>
            <li> Sekti išlaidas </li>
          </ul>
          Jums tereikia prisijungti su savo Google paskyra.
        </Grid>
        <Grid item xs={12}>
          Ateityje galėsite:
          <ul>
            <li> Išrašyti išankstines sąskaitas faktūras </li>
            <li> Automatiškai suskaičiuoti mokesčius </li>
            <li> Peržiūrėti apskaitos žurnalą </li>
            <li> ... ir daugiau. </li>
          </ul>
        </Grid>
      </Grid>
    </>
  );
}
