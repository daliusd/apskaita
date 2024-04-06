import { useState, useEffect } from 'react';
import { Button, NumberInput } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import useSWR from 'swr';

export default function ZeroesEdit() {
  const [zeroesCurrent, setZeroesCurrent] = useState<number | undefined>(
    undefined,
  );
  const [zeroes, setZeroes] = useState(0);
  const [enabled, setEnabled] = useState(false);

  const { data } = useSWR('/api/settings/zeroes');

  useEffect(() => {
    if (data && data.value) {
      setZeroes(data.value);
      setZeroesCurrent(data.value);
    }
    setEnabled(true);
  }, [data]);

  return (
    <>
      <NumberInput
        disabled={!enabled}
        label="Skaitmenų skaičius sąskaitos faktūros serijos numeryje"
        aria-label={'Skaitmenų skaičius sąskaitos faktūros serijos numeryje'}
        description="Pavyzdžiui, jei įrašysite 6, tai jūsų serijos numeris atrodys kaip 000001. Šis nustatymas veikia tik naujoms ir naujai išsaugotoms sąskaitoms faktūroms."
        value={zeroes}
        onChange={(value) => {
          if (typeof value === 'string') return;
          setZeroes(value);
        }}
      />

      <Button
        leftSection={<IconEdit />}
        variant="subtle"
        disabled={zeroes === zeroesCurrent}
        onClick={async () => {
          try {
            await fetch('/api/settings/zeroes', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: zeroes }),
            });
            setZeroesCurrent(zeroes);
          } catch {}
        }}
        aria-label="Išsaugoti skaitmenų skaičių"
      >
        Išsaugoti
      </Button>
    </>
  );
}
