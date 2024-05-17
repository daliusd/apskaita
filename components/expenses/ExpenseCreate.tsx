import { Button, Grid } from '@mantine/core';
import { useRouter } from 'next/router';

export default function ExpenseCreate() {
  const router = useRouter();

  const handleClickOpen = () => {
    router.push('/islaidos/nauja');
  };

  return (
    <Grid.Col span={12}>
      <Button variant="filled" onClick={handleClickOpen}>
        Pridėti išlaidų įrašą
      </Button>
    </Grid.Col>
  );
}
