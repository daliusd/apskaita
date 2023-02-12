import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import useSWR from 'swr';

export default function ZeroesEdit() {
  const [zeroesCurrent, setZeroesCurrent] = useState<string | undefined>(
    undefined,
  );
  const [zeroes, setZeroes] = useState('');
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
      <TextField
        disabled={!enabled}
        label="Skaitmenų skaičius sąskaitos faktūros serijos numeryje"
        inputProps={{
          'aria-label':
            'Skaitmenų skaičius sąskaitos faktūros serijos numeryje',
        }}
        helperText="Pavyzdžiui, jei įrašysite 6, tai jūsų serijos numeris atrodys kaip 000001. Šis nustatymas veikia tik naujoms ir naujai išsaugotoms sąskaitoms faktūroms."
        type="number"
        value={zeroes}
        onChange={(e) => {
          setZeroes(e.target.value);
        }}
        fullWidth
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
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
