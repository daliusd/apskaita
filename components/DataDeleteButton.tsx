import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { signOut } from 'next-auth/client';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';

import { messageSeverityState, messageTextState } from '../src/atoms';

export default function DataDeleteButton() {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleDelete = async () => {
    const response = await fetch('/api/userdata', {
      method: 'DELETE',
    });

    if (!response.ok || !(await response.json()).success) {
      setMessageText('Klaida trinant paskyrą.');
      setMessageSeverity('error');
      return;
    }

    setMessageText('Jūsų paskyra ištrinta.');
    setMessageSeverity('info');
    signOut();
  };

  return (
    <>
      <Grid container item xs={12}>
        <Typography variant="body1" component="div">
          Taip pat galite ištrinti savo paskyrą.
        </Typography>
      </Grid>
      <Grid container item xs={12}>
        <Button
          variant="contained"
          color="secondary"
          aria-label="Ištrinti paskyrą"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          Ištrinti paskyrą
        </Button>

        <Dialog
          maxWidth="xs"
          aria-labelledby="delete-dialog-title"
          open={deleteOpen}
        >
          <DialogTitle id="delete-dialog-title">
            Ar tikrai norite ištrinti savo paskyrą?
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" component="div">
                  Jūsų duomenys bus ištrinti negrįžtamai ir jų nebebus galima
                  atstatyti.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreed}
                      onChange={() => setAgreed(!agreed)}
                      name="agreed"
                      color="primary"
                    />
                  }
                  label={'Taip, tikrai noriu ištrinti savo paskyrą.'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => setDeleteOpen(false)}
              color="primary"
            >
              Nutraukti
            </Button>

            <Button onClick={handleDelete} color="primary" disabled={!agreed}>
              Trinti
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
}
