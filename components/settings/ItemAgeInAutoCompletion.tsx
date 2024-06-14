import { useState, useEffect } from 'react';
import { Button, NumberInput, Title, Text, Stack, Group } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import useSWR from 'swr';

export function ItemAgeInAutoCompletion() {
  const [maxitemage, setMaxitemage] = useState(0);

  const { data } = useSWR('/api/settings/maxitemage');

  useEffect(() => {
    if (data) {
      setMaxitemage(data.value);
    }
  }, [data]);

  return (
    <Stack gap={12}>
      <Title order={4}>Nerodyti prekių senesnių nei...</Title>

      <Text>
        Vedant prekių informaciją Haiku.lt siūlo pasirinkti iš senų prekių
        sąrašo. Čia galite nurodyti, kad prekių senesnių negu jūsų nurodytas
        mėnesių skaičius nesiūlytų. Nurodykite 0, jei norite matyti visas
        prekes.
      </Text>

      <NumberInput
        disabled={!data}
        label="Nerodyti senesnių nei..."
        suffix=" mėn."
        value={maxitemage}
        onChange={(value) => {
          if (typeof value === 'string') return;
          setMaxitemage(value);
        }}
      />

      <Group>
        <Button
          leftSection={<IconEdit />}
          variant="subtle"
          onClick={async () => {
            try {
              await fetch('/api/settings/maxitemage', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: maxitemage }),
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
