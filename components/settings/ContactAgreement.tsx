import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import useSWR, { mutate } from 'swr';

import { messageSeverityState, messageTextState } from '../../src/atoms';

export default function ContactAgreement() {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [enabled, setEnabled] = useState(false);

  const { data: contactAgreementData } = useSWR(
    '/api/settings/contactagreement',
  );

  const agreed =
    contactAgreementData && contactAgreementData.value === '1' ? true : false;

  useEffect(() => {
    setEnabled(true);
  }, [contactAgreementData]);

  const handleContactAgreement = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;

    let response: Response;
    try {
      response = await fetch('/api/settings/contactagreement', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: checked ? '1' : '0' }),
      });
    } catch {}

    await mutate('/api/settings/contactagreement');

    if (!response || !response.ok || !(await response.json()).success) {
      setMessageText('Įvyko klaida duodant sutikimą susisiekti.');
      setMessageSeverity('error');
      return;
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Typography variant="h6" component="h1" noWrap>
          Sutikimas dėl susisiekimo
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1" component="div">
          „Haiku.lt“ tobulinimui mums kartais gali reikėti jūsų nuomonės,
          informacijos kaip jūs naudojatės sistema arba ko jums trūksta iš jos.
          Iš kitos pusės nesinori trukdyti vartotojų, kurie nori tiesiog
          naudotis sistema. Todėl klausiame ar sutinkate, kad mes kartais su
          jumis susisiektumėme:
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              disabled={!enabled}
              checked={agreed}
              onChange={handleContactAgreement}
              name="agreed"
              color="primary"
            />
          }
          label={'Sutinku, kad su manimi kartais susisiektumėte.'}
        />
      </Grid>
    </>
  );
}
