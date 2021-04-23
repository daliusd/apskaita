import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Head from 'next/head';

import Link from '../src/Link';

export default function IndexPageInfo() {
  return (
    <>
      <Head>
        <meta
          name="description"
          content="Individualios veiklos apskaita: paprastai ir greitai išrašykite sąskaitas, sugeneruokite PDF failus, išsiųskite juos el. paštu ir sekite išlaidas."
        />
      </Head>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body1" component="div">
            Individualios veiklos apskaita: paprastai ir greitai išrašykite
            sąskaitas, sugeneruokite PDF failus, išsiųskite juos el. paštu ir
            sekite išlaidas.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1" component="div">
            Peržiūrėkite <Link href="/straipsniai/palyginimas">palyginimą</Link>{' '}
            su kitomis sistemomis, kuris padės nuspręsti kodėl verta pasirinkti
            mus.
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
