import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import EditIcon from '@material-ui/icons/Edit';
import { useSession } from 'next-auth/client';
import useSWR from 'swr';

import { cleanUpString } from '../utils/textutils';

interface Props {
  language: string;
}

export default function SellerInfoEdit({ language }: Props) {
  const [session] = useSession();
  const [sellerCurrent, setSellerCurrent] = useState<string | undefined>(
    undefined,
  );
  const [seller, setSeller] = useState(
    `${session.user.name}\n${session.user.email}`,
  );

  const settingApiUrl = `/api/settings/seller${language === 'lt' ? '' : '_en'}`;

  const { data, error } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data && data.value) {
      setSeller(data.value);
      setSellerCurrent(data.value);
    }
  }, [data]);

  if (!data && !error) return <LinearProgress />;

  return (
    <>
      <TextField
        label="Tavo rekvizitai sąskaitai faktūrai"
        inputProps={{ 'aria-label': 'Tavo rekvizitai sąskaitai faktūrai' }}
        value={seller}
        onChange={(e) => {
          setSeller(cleanUpString(e.target.value));
        }}
        fullWidth
        multiline
        rows={4}
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={seller === sellerCurrent}
        aria-label="Išsaugoti rekvizitus"
        onClick={async () => {
          await fetch(settingApiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value: seller }),
          });
          setSellerCurrent(seller);
        }}
      >
        Išsaugoti rekvizitus
      </Button>
    </>
  );
}
