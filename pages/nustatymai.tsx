import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useSession } from 'next-auth/client';

import SellerInfoEdit from '../components/SellerInfoEdit';
import IssuerEdit from '../components/IssuerEdit';
import ExtraEdit from '../components/ExtraEdit';
import ZeroesEdit from '../components/ZeroesEdit';
import LogoEdit from '../components/LogoEdit';

export default function Apie() {
  const [session] = useSession();
  const [tab, setTab] = useState(0);
  const [language, setLanguage] = useState('lt');

  useEffect(() => {
    setLanguage(tab === 0 ? 'lt' : 'en');
  }, [tab]);

  if (!session) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Nustatymai
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Tabs value={tab} onChange={(_e, nv) => setTab(nv)}>
          <Tab label="Lietuvių kalbai" />
          <Tab label="Anglų kalbai" />
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        <SellerInfoEdit language={language} />
      </Grid>
      <Grid item xs={12}>
        <IssuerEdit language={language} />
      </Grid>
      <Grid item xs={12}>
        <ExtraEdit language={language} />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Kiti Nustatymai
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <ZeroesEdit />
      </Grid>
      <Grid item xs={12}>
        <LogoEdit />
      </Grid>
    </Grid>
  );
}
