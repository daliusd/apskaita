import { useState } from 'react';
import { Grid, Tabs, Title, Text } from '@mantine/core';
import { useSession } from 'next-auth/react';

import EmailTemplateEdit from '../components/settings/EmailTemplateEdit';
import EmailSubjectEdit from '../components/settings/EmailSubjectEdit';
import ZeroesEdit from '../components/settings/ZeroesEdit';
import LogoEdit from '../components/settings/LogoEdit';
import { BackgroundEdit } from '../components/settings/BackgroundEdit';
import ContactAgreement from '../components/settings/ContactAgreement';
import DataDeleteButton from '../components/settings/DataDeleteButton';
import { ApiToken } from '../components/settings/ApiToken';
import VATPayer from '../components/settings/VATPayer';
import Link from '../src/Link';
import { BuyerAgeInAutoCompletion } from '../components/settings/BuyerAgeInAutoCompletion';
import { ItemAgeInAutoCompletion } from '../components/settings/ItemAgeInAutoCompletion';
import { ExtraInputProgram } from '../components/settings/ExtraInputScript';

export default function Apie() {
  const { data: session } = useSession();

  const [language, setLanguage] = useState('lt');

  if (!session) {
    return null;
  }

  return (
    <Grid gutter={{ base: 24 }}>
      <Grid.Col span={{ base: 12 }}>
        <Title order={2}>Nustatymai</Title>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={{ base: 12 }}>
            <Title order={3}>Laiškų nustatymai</Title>
          </Grid.Col>
          <Grid.Col span={12}>
            <Tabs value={language} onChange={setLanguage}>
              <Tabs.List>
                <Tabs.Tab value="lt">Lietuvių kalbai</Tabs.Tab>
                <Tabs.Tab value="en">Anglų kalbai</Tabs.Tab>
              </Tabs.List>
            </Tabs>
          </Grid.Col>
          <Grid.Col span={12}>
            <EmailSubjectEdit language={language} />
          </Grid.Col>
          <Grid.Col span={12}>
            <EmailTemplateEdit language={language} />
          </Grid.Col>

          <Grid.Col span={12}>
            <Title order={3}>Sąskaitų Faktūrų nustatymai</Title>
          </Grid.Col>

          <Grid.Col span={12}>
            <ZeroesEdit />
          </Grid.Col>
          <Grid.Col span={12}>
            <LogoEdit />
          </Grid.Col>
          <Grid.Col span={12}>
            <BackgroundEdit />
          </Grid.Col>

          <VATPayer />

          <ExtraInputProgram />
        </Grid>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Grid gutter={{ base: 12 }}>
          <Grid.Col span={12}>
            <Title order={3}>Automatinis užbaigimas</Title>
          </Grid.Col>

          <Grid.Col span={12}>
            <BuyerAgeInAutoCompletion />
          </Grid.Col>
          <Grid.Col span={12}>
            <ItemAgeInAutoCompletion />
          </Grid.Col>
          <Grid.Col span={12}>
            <Title order={3}>Kiti Nustatymai</Title>
          </Grid.Col>

          <ContactAgreement />

          <Grid.Col span={12}>
            <Title order={4}>Jūsų duomenys ir paskyra</Title>
          </Grid.Col>

          <Grid.Col span={12}>
            <Text>
              Jeigu norite galite parsisiųsti savo duomenis kaip SQLite
              duombazę. <Link href="/api/userdata">Parsisiųsti</Link>. Daugiau
              informacijos{' '}
              <Link href="/straipsniai/duomenu-parsisiuntimas">
                „Duomenų parsisiuntimas“
              </Link>
              .
            </Text>
          </Grid.Col>

          <ApiToken />

          <DataDeleteButton />
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
