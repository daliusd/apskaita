import React, { useContext } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import useSWR, { mutate } from 'swr';

import { IContext, Context } from '../src/Store';

export default function ContactAgreement() {
  const { dispatch } = useContext<IContext>(Context);
  const { data: contactAgreementData } = useSWR(
    '/api/settings/contactagreement',
  );

  const agreed =
    contactAgreementData && contactAgreementData.value === '1' ? true : false;

  const handleContactAgreement = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;

    const response = await fetch('/api/settings/contactagreement', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: checked ? '1' : '0' }),
    });

    await mutate('/api/settings/contactagreement');

    if (!response.ok || !(await response.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Įvyko klaida duodant sutikimą susisiekti.',
        severity: 'error',
      });
      return;
    }
  };

  if (!contactAgreementData) {
    return null;
  }

  return (
    <>
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
