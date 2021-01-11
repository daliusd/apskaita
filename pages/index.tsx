import React from 'react';
import Link from '../src/Link';
import Grid from '@material-ui/core/Grid';
import { useSession } from 'next-auth/client';

import Invoices from '../components/Invoices';
import SellerInfoEdit from '../components/SellerInfoEdit';

export default function Index() {
  const [session] = useSession();

  if (!session) {
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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        Esi prisijungęs/prisijungusi kaip {session.user.email}.
      </Grid>
      <Grid item xs={12}>
        <SellerInfoEdit />
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
