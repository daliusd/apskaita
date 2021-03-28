import React, { useContext, useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { CircularProgress } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloudUpload from '@material-ui/icons/CloudUpload';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { useSession } from 'next-auth/client';

import { getMsSinceEpoch } from '../utils/date';
import { IContext, Context } from '../src/Store';

export interface ExpenseCreateDialogProps {
  open: boolean;
  onCreate: () => void;
  onClose: () => void;
}

function ExpenseCreateDialog(props: ExpenseCreateDialogProps) {
  const [session] = useSession();
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [price, setPrice] = useState('0');
  const [file, setFile] = useState<File>(null);
  const [inProgress, setInProgress] = useState(false);
  const { dispatch } = useContext<IContext>(Context);

  const { onClose, onCreate, open } = props;

  const gdrive = ((session as unknown) as { gdrive: boolean }).gdrive;

  const handleClose = () => {
    onClose();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files[0]);
  };

  const handleCreateExpense = async () => {
    setInProgress(true);

    const data = new FormData();
    data.append('description', description);
    data.append('price', price);
    data.append('created', getMsSinceEpoch(date).toString());
    if (file !== null) {
      data.append('file', file);
    }

    const resp = await fetch('/api/expenses', {
      method: 'POST',
      body: data,
    });

    setInProgress(false);
    if (!resp.ok || !(await resp.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Nepavyko pridėti išlaidų.',
        severity: 'error',
      });
      return;
    }
    dispatch({
      type: 'SET_MESSAGE',
      text: 'Išlaidos pridėtos.',
      severity: 'success',
    });

    onCreate();
    handleClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="expense-create-dialog"
      open={open}
    >
      <DialogTitle id="expense-create-dialog">Pridėti išlaidas</DialogTitle>
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

          {gdrive && (
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
                aria-label="Pridėti išlaidas"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateExpense}
              >
                Pridėti išlaidas
              </Button>
            )}
            {inProgress && <CircularProgress />}
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}

interface ExpenseCreateProps {
  onCreate: () => void;
}

export default function Index({ onCreate }: ExpenseCreateProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid item xs={12}>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Pridėti išlaidas
      </Button>
      {open && (
        <ExpenseCreateDialog
          open={open}
          onClose={handleClose}
          onCreate={onCreate}
        />
      )}
    </Grid>
  );
}
