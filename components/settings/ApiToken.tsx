import { Button, Grid, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { IconKey } from '@tabler/icons-react';
import { postApiToken } from '../api/postApiToken';
import { useState } from 'react';
import { useCopyToClipboard } from 'react-use';

export function ApiToken() {
  const [token, setToken] = useState('');
  const [isCopied, setIsCopied] = useCopyToClipboard();

  const onClick = async () => {
    const result = await postApiToken();
    if (!result.success) {
      notifications.show({
        message: 'Nepavyko sugeneruoti rakto.',
        color: 'red',
      });
      return;
    }
    setToken(result.token);
  };

  return (
    <Grid.Col span={12}>
      <Stack gap="12px">
        <Text>
          Savo duomenis taip pat galite pasiekti naudodami API. Čia galite
          susigeneruoti API raktą. API raktas bus rodomas tik jį sugeneravus.
          Jei sugeneruosite naują raktą - senasis nebegalios.
        </Text>
        <Group>
          <Button
            variant="light"
            aria-label="Generuoti raktą"
            leftSection={<IconKey />}
            onClick={onClick}
          >
            Generuoti raktą
          </Button>
        </Group>
        {token && (
          <>
            <TextInput value={token} readOnly={true} />
            <Group justify="flex-end">
              <Button
                variant="outline"
                aria-label="Kopijuoti raktą"
                onClick={() => {
                  setIsCopied(token);
                  notifications.show({
                    message: 'API raktas nukopijuotas.',
                    color: 'green',
                  });
                }}
              >
                Kopijuoti raktą
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Grid.Col>
  );
}
