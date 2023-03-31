import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useSession } from 'next-auth/react';

import SellerInfoEdit from '../components/settings/SellerInfoEdit';
import IssuerEdit from '../components/settings/IssuerEdit';
import ExtraEdit from '../components/settings/ExtraEdit';
import EmailTemplateEdit from '../components/settings/EmailTemplateEdit';
import EmailSubjectEdit from '../components/settings/EmailSubjectEdit';
import ZeroesEdit from '../components/settings/ZeroesEdit';
import LogoEdit from '../components/settings/LogoEdit';
import ContactAgreement from '../components/settings/ContactAgreement';
import DataDeleteButton from '../components/settings/DataDeleteButton';
import Link from '../src/Link';

export default function Apie() {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;

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
      {gmailSend && (
        <Grid item xs={12}>
          <EmailSubjectEdit language={language} />
        </Grid>
      )}
      {gmailSend && (
        <Grid item xs={12}>
          <EmailTemplateEdit language={language} />
        </Grid>
      )}

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

      <ContactAgreement />

      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Jūsų duomenys ir paskyra
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Jeigu norite galite parsisiųsti savo duomenis kaip SQLite duombazę.{' '}
          <Link href="/api/userdata">Parsisiųsti</Link>. Daugiau informacijos{' '}
          <Link href="/straipsniai/duomenu-parsisiuntimas">
            „Duomenų parsisiuntimas“
          </Link>
          .
        </Typography>
      </Grid>

      <DataDeleteButton />
    </Grid>
  );
}
