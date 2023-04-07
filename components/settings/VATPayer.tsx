import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import useSWR, { mutate } from 'swr';

import { messageSeverityState, messageTextState } from '../../src/atoms';

export default function VATPayer() {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [enabled, setEnabled] = useState(false);

  const { data: vatPayerData } = useSWR('/api/settings/vatpayer');

  const isVatPayer = vatPayerData && vatPayerData.value === '1' ? true : false;

  useEffect(() => {
    setEnabled(true);
  }, [vatPayerData]);

  const handleVatPayer = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/settings/vatpayer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: checked ? '1' : '0' }),
      });
    } catch {}

    await mutate('/api/settings/vatpayer');

    if (!response || !response.ok || !(await response.json()).success) {
      setMessageText('Įvyko klaida keičiant PVM mokėtojo būseną.');
      setMessageSeverity('error');
      return;
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          PVM Mokėtojas
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          Jeigu esate PVM mokėtojas pažymėkite žemiau esančią varnelę. Ją
          pažymėjus sąskaitose faktūrose galėsite nurodyti PVM dydį, taip pat
          PDF failai bus generuojami kaip PVM sąskaitos faktūros.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              disabled={!enabled}
              checked={isVatPayer}
              onChange={handleVatPayer}
              name="isVatPayer"
              color="primary"
              aria-label="PVM mokėtojas"
            />
          }
          label={'Esu PVM mokėtojas.'}
        />
      </Grid>
    </>
  );
}
