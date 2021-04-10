import React, { useContext, useState } from 'react';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useSession } from 'next-auth/client';

import { getMsSinceEpoch } from '../utils/date';
import { IContext, Context } from '../src/Store';
import { IExpense } from '../db/db';

export interface ExpenseEditDialogProps {
  expense?: IExpense;
  onChange: () => void;
  onClose: () => void;
}

export default function ExpenseEditDialog(props: ExpenseEditDialogProps) {
  const { expense } = props;
  const [session] = useSession();
  const [description, setDescription] = useState(
    expense ? expense.description : '',
  );
  const [date, setDate] = useState(
    expense ? new Date(expense.created) : new Date(),
  );
  const [price, setPrice] = useState(expense ? expense.price.toString() : '0');
  const [file, setFile] = useState<File>(null);
  const [inProgress, setInProgress] = useState(false);
  const { dispatch } = useContext<IContext>(Context);

  const { onClose, onChange } = props;

  const gdrive =
    session && ((session as unknown) as { gdrive: boolean }).gdrive;

  const handleClose = () => {
    onClose();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const handleCreateExpense = async () => {
    setInProgress(true);

    let resp;
    if (expense) {
      const newExpense = {
        description,
        created: getMsSinceEpoch(date).toString(),
        price: price,
      };

      resp = await fetch('/api/expenses/' + expense.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });
    } else {
      const data = new FormData();
      data.append('description', description);
      data.append('price', price);
      data.append('created', getMsSinceEpoch(date).toString());
      if (file !== null) {
        data.append('file', file);
      }

      resp = await fetch('/api/expenses', {
        method: 'POST',
        body: data,
      });
    }

    setInProgress(false);
    if (!resp.ok || !(await resp.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: expense
          ? 'Nepavyko pakeisti išlaidų įrašo'
          : 'Nepavyko pridėti išlaidų įrašo.',
        severity: 'error',
      });
      return;
    }
    dispatch({
      type: 'SET_MESSAGE',
      text: expense ? 'Išlaidų įrašas pakeistas' : 'Išlaidos įrašas pridėtas.',
      severity: 'success',
    });

    handleClose();
    onChange();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="expense-edit-dialog"
      open={true}
    >
      <DialogTitle id="expense-edit-dialog">
        {expense ? 'Keisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'}
      </DialogTitle>
      <Box m={4}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              inputProps={{ 'aria-label': 'Išlaidų aprašymas' }}
              label="Išlaidų aprašymas"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <KeyboardDatePicker
              label="Išlaidų data"
              autoOk={true}
              inputProps={{ 'aria-label': 'Išlaidų data' }}
              value={date}
              onChange={setDate}
              format="yyyy-MM-dd"
              fullWidth
              invalidDateMessage={'Neteisingas datos formatas'}
              okLabel="Gerai"
              cancelLabel="Nutraukti"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              type="number"
              label="Išlaidų suma"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
              }}
              fullWidth
            />
          </Grid>

          {gdrive && !expense && (
            <Grid item xs={12}>
              {file === null && (
                <Button
                  startIcon={<CloudUpload />}
                  color="primary"
                  component="label"
                  aria-label="Pridėti failą"
                >
                  Pridėti failą
                  <input type="file" hidden onChange={handleChange} />
                </Button>
              )}
              {file !== null && (
                <Typography variant="body1" component="div">
                  Failas: {file.name}
                </Typography>
              )}
            </Grid>
          )}

          <Grid item xs={12}>
            {!inProgress && (
              <Button
                aria-label={
                  expense ? 'Pakeisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'
                }
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateExpense}
              >
                {expense ? 'Pakeisti išlaidų įrašą' : 'Pridėti išlaidų įrašą'}
              </Button>
            )}
            {inProgress && <CircularProgress />}
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}
