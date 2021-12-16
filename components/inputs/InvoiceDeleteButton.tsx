import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';

import DeleteIcon from '@material-ui/icons/Delete';
import { useRouter } from 'next/router';

import { messageSeverityState, messageTextState } from '../../src/atoms';

interface IProps {
  invoiceId?: string;
  disabled: boolean;
}

export default function InvoiceDeleteButton({ invoiceId, disabled }: IProps) {
  const router = useRouter();
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!invoiceId) return null;

  const handleDelete = async () => {
    const response = await fetch('/api/invoices/' + invoiceId, {
      method: 'DELETE',
    });

    if (!response.ok || !(await response.json()).success) {
      setMessageText('Klaida trinant sąskaitą faktūrą.');
      setMessageSeverity('error');
      return;
    }

    router.replace(`/saskaitos`);
    setMessageText('Sąskaita faktūra ištrinta.');
    setMessageSeverity('info');
  };

  return (
    <Grid container item xs={12} justifyContent="flex-end">
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
            Taip, trinti
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
