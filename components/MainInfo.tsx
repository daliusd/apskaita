import Link from '../src/Link';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Invoices from '../components/Invoices';
import Stats from './Stats';

export default function MainInfo() {
  const { data: session } = useSession();
  const router = useRouter();

  const onClickCreateInvoice = () => {
    router.push('/saskaitos/nauja');
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Esi prisijungęs/prisijungusi kaip {session.user.email}. Savo
          nustatymus galite pakeisti{' '}
          <Link href="/nustatymai" color="secondary">
            čia
          </Link>
          . Pagalbos skyrių rasite{' '}
          <Link href="/pagalba" color="secondary">
            čia
          </Link>
          .
        </Typography>
      </Grid>
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
      <Stats />

      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Paskutinės sąskaitos faktūros
        </Typography>
      </Grid>
      <Invoices limit={5} />
      <Grid item xs={12}>
        <Link href="/saskaitos" color="secondary">
          Detalesnė sąskaitų faktūrų paieška
        </Link>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Kiti įrankiai
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Link href="/iv-skaiciuokle">
          Individualios Veiklos mokesčių skaičiuokle
        </Link>
      </Grid>
      <Grid item xs={12}>
        <Link href="/pajamu-islaidu-zurnalas">
          Pajamų Ir Išlaidų Apskaitos Žurnalo Generatorius
        </Link>
      </Grid>
    </Grid>
  );
}
