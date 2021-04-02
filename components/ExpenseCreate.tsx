import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import ExpenseEditDialog from './ExpenseEditDialog';

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
        Pridėti išlaidų įrašą
      </Button>
      {open && <ExpenseEditDialog onClose={handleClose} onChange={onCreate} />}
    </Grid>
  );
}
