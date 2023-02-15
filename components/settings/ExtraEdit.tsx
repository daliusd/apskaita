import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import useSWR, { mutate } from 'swr';

import { cleanUpString } from '../../utils/textutils';

interface Props {
  language: string;
}

export default function ExtraEdit({ language }: Props) {
  const [extraCurrent, setExtraCurrent] = useState<string | undefined>(
    undefined,
  );
  const [extra, setExtra] = useState('');
  const [enabled, setEnabled] = useState(false);

  const settingApiUrl = `/api/settings/extra${language === 'lt' ? '' : '_en'}`;

  const { data } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data && data.value) {
      setExtra(data.value);
      setExtraCurrent(data.value);
    }
    setEnabled(true);
  }, [data]);

  return (
    <>
      <TextField
        disabled={!enabled}
        label="Papildoma informacija sąskaitoje faktūroje"
        inputProps={{
          'aria-label': 'Papildoma informacija sąskaitoje faktūroje',
        }}
        helperText="Pavyzdžiui „Prašome apmokėti sąskaitą faktūrą per 10 dienų“"
        value={extra}
        onChange={(e) => {
          setExtra(cleanUpString(e.target.value));
        }}
        fullWidth
        multiline
        minRows={2}
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={extra === extraCurrent}
        onClick={async () => {
          try {
            await fetch(settingApiUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: extra }),
            });
            setExtraCurrent(extra);
            mutate(settingApiUrl);
          } catch {}
        }}
        aria-label="Išsaugoti papildomą informaciją"
      >
        Išsaugoti
      </Button>
    </>
  );
}
