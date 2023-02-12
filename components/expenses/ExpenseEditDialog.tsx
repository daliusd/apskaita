import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUpload from '@mui/icons-material/CloudUpload';
import { DatePicker } from '@mui/x-date-pickers';
import { useSession } from 'next-auth/react';

import { getMsSinceEpoch } from '../../utils/date';
import { IExpense } from '../../db/db';
import { messageSeverityState, messageTextState } from '../../src/atoms';

export interface ExpenseEditDialogProps {
  expense?: IExpense;
  onChange: () => void;
  onClose: () => void;
}

export default function ExpenseEditDialog(props: ExpenseEditDialogProps) {
  const { expense } = props;
  const { data: session } = useSession();
  const [description, setDescription] = useState(
    expense ? expense.description : '',
  );
  const [date, setDate] = useState(
    expense ? new Date(expense.created) : new Date(),
  );
  const [price, setPrice] = useState(expense ? expense.price.toString() : '0');
  const [file, setFile] = useState<File>(null);
  const [inProgress, setInProgress] = useState(false);
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);

  const { onClose, onChange } = props;

  const gdrive = session && (session as unknown as { gdrive: boolean }).gdrive;

  const handleClose = () => {
    onClose();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const handleCreateExpense = async () => {
    setInProgress(true);

    let resp: Response;
    try {
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
    } catch {}

    setInProgress(false);
    if (!resp || !resp.ok || !(await resp.json()).success) {
      setMessageText(
        expense
          ? 'Nepavyko pakeisti išlaidų įrašo'
          : 'Nepavyko pridėti išlaidų įrašo.',
      );
      setMessageSeverity('error');
      return;
    }

    setMessageText(
      expense ? 'Išlaidų įrašas pakeistas' : 'Išlaidos įrašas pridėtas.',
    );
    setMessageSeverity('success');

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
              variant="standard"
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
            <DatePicker
              label="Išlaidų data"
              value={date}
              onChange={setDate}
              inputFormat="yyyy-MM-dd"
              renderInput={(params) => (
                <TextField
                  fullWidth
                  {...params}
                  inputProps={{
                    'aria-label': 'Išlaidų data',
                    ...params.inputProps,
                  }}
                  variant="standard"
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              variant="standard"
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
