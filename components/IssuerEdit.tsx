import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import EditIcon from '@material-ui/icons/Edit';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';

export default function IssuerEdit() {
  const [session] = useSession();
  const [issuerCurrent, setIssuerCurrent] = useState<string | undefined>(
    undefined,
  );
  const [issuer, setIssuer] = useState(session.user.name);

  const { data, error } = useSWR('/api/settings/issuer');

  useEffect(() => {
    if (data && data.value) {
      setIssuer(data.value);
      setIssuerCurrent(data.value);
    }
  }, [data]);

  if (!data && !error) return <LinearProgress />;

  return (
    <>
      <TextField
        label="Asmuo įprastai išrašantis sąskaitas faktūras"
        value={issuer}
        onChange={(e) => {
          setIssuer(e.target.value);
        }}
        fullWidth
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={issuer === issuerCurrent}
        onClick={async () => {
          await fetch('/api/settings/issuer', {
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
