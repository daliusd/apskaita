import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import { useSession } from 'next-auth/react';
import useSWR, { mutate } from 'swr';

import { cleanUpString } from '../../utils/textutils';

interface Props {
  language: string;
}

export default function SellerInfoEdit({ language }: Props) {
  const { data: session } = useSession();
  const [sellerCurrent, setSellerCurrent] = useState<string | undefined>(
    undefined,
  );
  const [seller, setSeller] = useState(
    `${session.user.name}\n${session.user.email}`,
  );
  const [enabled, setEnabled] = useState(false);

  const settingApiUrl = `/api/settings/seller${language === 'lt' ? '' : '_en'}`;

  const { data } = useSWR(settingApiUrl);

  useEffect(() => {
    if (data && data.value) {
      setSeller(data.value);
      setSellerCurrent(data.value);
    }
    setEnabled(true);
  }, [data]);

  return (
    <>
      <TextField
        disabled={!enabled}
        label="Tavo rekvizitai sąskaitai faktūrai"
        inputProps={{ 'aria-label': 'Tavo rekvizitai sąskaitai faktūrai' }}
        value={seller}
        onChange={(e) => {
          setSeller(cleanUpString(e.target.value));
        }}
        fullWidth
        multiline
        minRows={4}
        variant="outlined"
      />

      <Button
        color="primary"
        startIcon={<EditIcon />}
        disabled={seller === sellerCurrent}
        aria-label="Išsaugoti rekvizitus"
        onClick={async () => {
          try {
            await fetch(settingApiUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ value: seller }),
            });
            setSellerCurrent(seller);
            mutate(settingApiUrl);
          } catch {}
        }}
      >
        Išsaugoti rekvizitus
      </Button>
    </>
  );
}
