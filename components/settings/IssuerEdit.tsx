import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';

import { cleanUpString } from '../../utils/textutils';

interface Props {
  language: string;
}

export default function IssuerEdit({ language }: Props) {
  const { data: session } = useSession();
  const [issuerCurrent, setIssuerCurrent] = useState<string | undefined>(
    undefined,
  );
  const [issuer, setIssuer] = useState(session.user.name);
  const [enabled, setEnabled] = useState(false);

  const settingApiUrl = `/api/settings/issuer${language === 'lt' ? '' : '_en'}`;

  const { data } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data && data.value) {
      setIssuer(data.value);
      setIssuerCurrent(data.value);
    }
    setEnabled(true);
  }, [data]);

  return (
    <>
      <TextField
        disabled={!enabled}
        label="Asmuo įprastai išrašantis sąskaitas faktūras"
        inputProps={{
          'aria-label': 'Asmuo įprastai išrašantis sąskaitas faktūras',
        }}
        value={issuer}
        onChange={(e) => {
          setIssuer(cleanUpString(e.target.value));
        }}
        fullWidth
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={issuer === issuerCurrent}
        aria-label="Išsaugoti asmenį išrašantį sąskaitas"
        onClick={async () => {
          try {
            await fetch(settingApiUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: issuer }),
            });
            setIssuerCurrent(issuer);
            mutate(settingApiUrl);
          } catch {}
        }}
      >
        Išsaugoti
      </Button>
    </>
  );
}
