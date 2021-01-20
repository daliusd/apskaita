import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import EditIcon from '@material-ui/icons/Edit';
import useSWR from 'swr';

export default function ZeroesEdit() {
  const [zeroesCurrent, setZeroesCurrent] = useState<string | undefined>(
    undefined,
  );
  const [zeroes, setZeroes] = useState('');

  const { data, error } = useSWR('/api/settings/zeroes');

  useEffect(() => {
    if (data && data.value) {
      setZeroes(data.value);
      setZeroesCurrent(data.value);
    }
  }, [data]);

  if (!data && !error) return <LinearProgress />;

  return (
    <>
      <TextField
        label="Nulių skaičius sąskaitoje faktūroje"
        helperText="Šis nustatymas veikia tik naujoms ir naujai išsaugotoms sąskaitoms faktūroms."
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
          await fetch('/api/settings/zeroes', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: zeroes }),
          });
          setZeroesCurrent(zeroes);
        }}
      >
        Išsaugoti
      </Button>
    </>
  );
}
