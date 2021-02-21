import React, { useContext } from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  locked: boolean;
  setLocked: (v: boolean) => void;
  withHelperText?: boolean;
}

export default function InvoiceEditLocked({
  invoiceId,
  locked,
  setLocked,
  withHelperText,
}: IProps) {
  const { dispatch } = useContext<IContext>(Context);

  if (!invoiceId) return null;

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const locked = event.target.checked;

    const response = await fetch('/api/invoiceslocked/' + invoiceId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locked }),
    });

    if (!response.ok || !(await response.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Įvyko klaida užrakinant/atrakinant sąskaitą.',
        severity: 'error',
      });
      return;
    }

    setLocked(locked);
  };

  return (
    <Grid item xs={12}>
      <FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={locked}
              onChange={handleChange}
              name="locked"
              color="primary"
            />
          }
          label={
            locked ? 'Sąskaita faktūra užrakinta' : 'Sąskaita faktūra atrakinta'
          }
        />
        {withHelperText && (
          <FormHelperText>
            Užrakinta sąskaita faktūra negali būti pakeista ir ištrinta.
          </FormHelperText>
        )}
      </FormControl>
    </Grid>
  );
}
