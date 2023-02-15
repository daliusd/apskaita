import React from 'react';
import { useRecoilState } from 'recoil';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import useSWR, { mutate } from 'swr';

import { messageSeverityState, messageTextState } from '../../src/atoms';

export default function LogoEdit() {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  const { data, error } = useSWR('/api/settings/logo');

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const data = new FormData();
    data.append('logo', event.target.files[0]);

    event.target.value = null; // reset

    let resp: Response;
    try {
      resp = await fetch('/api/logo', {
        method: 'POST',
        body: data,
      });
    } catch {}

    if (!resp || !resp.ok || !(await resp.json()).success) {
      setMessageText('Nepavyko pakeisti logo.');
      setMessageSeverity('error');
      return;
    }

    setMessageText('Logo pakeistas.');
    setMessageSeverity('success');

    await mutate('/api/settings/logo');
  };

  const handleDelete = async () => {
    try {
      await fetch('/api/settings/logo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: '' }),
      });

      await mutate('/api/settings/logo');
    } catch {}
  };

  const loaded = data || error;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Logo
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Galite pridėti/pakeisti logotipą, kuris bus naudojamas sąskaitos
          faktūros PDF faile.
        </Typography>
      </Grid>
      {!loaded && <CircularProgress />}
      {loaded && (
        <>
          {data && data.value && (
            <Grid item xs={12}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.value} alt="logo" />
            </Grid>
          )}
          <Grid item xs={12}>
            <Button
              startIcon={<ImageIcon />}
              color="primary"
              component="label"
              aria-label="Pakeisti logo"
            >
              Pakeisti logo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleChange}
              />
            </Button>
            {data && data.value && (
              <Button
                startIcon={<DeleteIcon />}
                color="secondary"
                aria-label="Pašalinti logo"
                onClick={handleDelete}
              >
                Pašalinti logo
              </Button>
            )}
          </Grid>
        </>
      )}
    </Grid>
  );
}
