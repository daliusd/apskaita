import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import EditIcon from '@material-ui/icons/Edit';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';

import { cleanUpString } from '../utils/textutils';

interface Props {
  language: string;
}

export default function IssuerEdit({ language }: Props) {
  const [session] = useSession();
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
          await fetch(settingApiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: issuer }),
          });
          setIssuerCurrent(issuer);
        }}
      >
        Išsaugoti
      </Button>
    </>
  );
}
