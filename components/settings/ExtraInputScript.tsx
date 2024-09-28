import { useState, useEffect } from 'react';
import { IconEdit } from '@tabler/icons-react';
import useSWR from 'swr';

import Link from '../../src/Link';
import { Button, Grid, Textarea, Text, Title } from '@mantine/core';
import { usePlan } from '../../src/usePlan';

const settingApiUrl = `/api/settings/extrainputprogram`;

export function ExtraInputProgram() {
  const { isFree } = usePlan();
  const [extraInputProgram, setExtraInputProgram] = useState('');

  const { data } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data) {
      setExtraInputProgram(data.value);
    }
  }, [data]);

  return (
    <>
      <Grid.Col span={12}>
        <Title order={4}>Papildomos informacijos programa</Title>
        <Text>
          Čia galite aprašyti programą, kuri bus naudojama nustatant papildomą
          informaciją. Daugiau informacijos čia:{' '}
          <Link href="/straipsniai/papildomos-informacijos-programavimas">
            „Papildomos informacijos programavimas“
          </Link>
          .
        </Text>
      </Grid.Col>
      <Grid.Col span={12}>
        <Textarea
          disabled={!data || isFree}
          label="Papildomos informacijos programa"
          aria-label={'Papildomos informacijos programa'}
          value={extraInputProgram}
          onChange={(e) => {
            setExtraInputProgram(e.target.value);
          }}
          autosize
          minRows={8}
        />

        {isFree && <Text>Šis funkcionalumas reikalauja Pro plano.</Text>}
        {!isFree && (
          <Button
            variant="subtle"
            leftSection={<IconEdit />}
            onClick={async () => {
              try {
                await fetch(settingApiUrl, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ value: extraInputProgram || '' }),
                });
              } catch {}
            }}
            aria-label="Išsaugoti papildomos informacijos programą"
          >
            Išsaugoti
          </Button>
        )}
      </Grid.Col>
    </>
  );
}
