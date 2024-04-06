import { useState } from 'react';
import { Button, Grid } from '@mantine/core';

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
    <Grid.Col span={12}>
      <Button variant="filled" onClick={handleClickOpen}>
        Pridėti išlaidų įrašą
      </Button>
      {open && <ExpenseEditDialog onClose={handleClose} onChange={onCreate} />}
    </Grid.Col>
  );
}
