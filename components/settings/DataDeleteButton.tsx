import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { signOut } from 'next-auth/react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';

import DeleteIcon from '@mui/icons-material/Delete';

import { messageSeverityState, messageTextState } from '../../src/atoms';

export default function DataDeleteButton() {
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleDelete = async () => {
    let response: Response;
    try {
      response = await fetch('/api/userdata', {
        method: 'DELETE',
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
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
