import React from 'react';
import { useRecoilState } from 'recoil';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ImageIcon from '@material-ui/icons/Image';
import DeleteIcon from '@material-ui/icons/Delete';
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

    const resp = await fetch('/api/logo', {
      method: 'POST',
      body: data,
    });

    if (!resp.ok || !(await resp.json()).success) {
      setMessageText('Nepavyko pakeisti logo.');
      setMessageSeverity('error');
      return;
    }

    setMessageText('Logo pakeistas.');
    setMessageSeverity('success');

    await mutate('/api/settings/logo');
  };

  const handleDelete = async () => {
    await fetch('/api/settings/logo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: '' }),
    });

    await mutate('/api/settings/logo');
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
