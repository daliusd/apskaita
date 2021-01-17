import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import EditIcon from '@material-ui/icons/Edit';
import useSWR from 'swr';

export default function ExtraEdit() {
  const [extraCurrent, setExtraCurrent] = useState<string | undefined>(
    undefined,
  );
  const [extra, setExtra] = useState('');

  const { data, error } = useSWR('/api/settings/extra');

  useEffect(() => {
    if (data) {
      setExtra(data.value);
      setExtraCurrent(data.value);
    }
  }, [data]);

  if (!data && !error) return <LinearProgress />;

  return (
    <>
      <TextField
        label="Numatyta papildoma informacija sąskaitoje faktūroje"
        value={extra}
        onChange={(e) => {
          setExtra(e.target.value);
        }}
        fullWidth
        multiline
        rows={2}
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={extra === extraCurrent}
        onClick={async () => {
          await fetch('/api/settings/extra', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: extra }),
          });
          setExtraCurrent(extra);
        }}
      >
        Išsaugoti
      </Button>
    </>
  );
}
