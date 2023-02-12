import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import ExpenseEditDialog from './ExpenseEditDialog';

interface ExpenseCreateProps {
  onCreate: () => void;
}

export default function ExpenseCreate({ onCreate }: ExpenseCreateProps) {
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
        Pridėti išlaidų įrašą
      </Button>
      {open && <ExpenseEditDialog onClose={handleClose} onChange={onCreate} />}
    </Grid>
  );
}
