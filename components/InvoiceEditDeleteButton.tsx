import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';

import DeleteIcon from '@material-ui/icons/Delete';
import { useRouter } from 'next/router';

import { IContext, Context } from '../src/Store';

interface IProps {
  invoiceId?: string;
  disabled: boolean;
}

export default function InvoiceEditDeleteButton({
  invoiceId,
  disabled,
}: IProps) {
  const router = useRouter();
  const { dispatch } = useContext<IContext>(Context);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!invoiceId) return null;

  const handleDelete = async () => {
    const response = await fetch('/api/invoices/' + invoiceId, {
      method: 'DELETE',
    });

    if (!response.ok || !(await response.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Klaida trinant sąskaitą faktūrą.',
        severity: 'error',
      });
      return;
    }

    router.replace(`/saskaitos`);
    dispatch({
      type: 'SET_MESSAGE',
      text: 'Sąskaita faktūra ištrinta.',
      severity: 'info',
    });
  };

  return (
    <Grid container item xs={12} justify="flex-end">
      <Button
        variant="contained"
        color="secondary"
        aria-label="Trinti"
        startIcon={<DeleteIcon />}
        onClick={() => setDeleteOpen(true)}
        disabled={disabled}
      >
        Trinti
      </Button>

      <Dialog
        maxWidth="xs"
        aria-labelledby="delete-dialog-title"
        open={deleteOpen}
      >
        <DialogTitle id="delete-dialog-title">
          Ar tikrai norite ištrinti SF?
        </DialogTitle>
        <DialogContent dividers>
          Mes leidžiame ištrinti sąskaitą faktūrą, tačiau jūs turėsite
          užtikrinti, kad serijos numeris būtų panaudotas kitai sąskaitai
          faktūrai. Ar tikrai norite ištrinti sąskaitą faktūrą?
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setDeleteOpen(false)}
            color="primary"
          >
            Nutraukti
          </Button>
          <Button onClick={handleDelete} color="primary">
            Trinti
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
