import { useState, useEffect } from 'react';
import { Button, NumberInput, Title, Text, Stack, Group } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import useSWR from 'swr';

export function BuyerAgeInAutoCompletion() {
  const [maxbuyerage, setMaxbuyerage] = useState(0);

  const { data } = useSWR('/api/settings/maxbuyerage');

  useEffect(() => {
    if (data) {
      setMaxbuyerage(data.value);
    }
  }, [data]);

  return (
    <Stack gap={12}>
      <Title order={4}>Nerodyti pirkėjų senesnių nei...</Title>

      <Text>
        Vedant pirkėjo informaciją Haiku.lt siūlo pasirinkti iš senų pirkėjų
        sąrašo. Čia galite nurodyti, kad pirkėjų senesnių negu jūsų nurodytas
        mėnesių skaičius nesiūlytų. Nurodykite 0, jei norite matyti visus
        pirkėjus.
      </Text>

      <NumberInput
        disabled={!data}
        label="Nerodyti senesnių nei..."
        suffix=" mėn."
        value={maxbuyerage}
        onChange={(value) => {
          if (typeof value === 'string') return;
          setMaxbuyerage(value);
        }}
      />

      <Group>
        <Button
          leftSection={<IconEdit />}
          variant="subtle"
          onClick={async () => {
            try {
              await fetch('/api/settings/maxbuyerage', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: maxbuyerage }),
              });
            } catch {}
          }}
          aria-label="Išsaugoti skaitmenų skaičių"
        >
          Išsaugoti
        </Button>
      </Group>
    </Stack>
  );
}
