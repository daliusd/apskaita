import { Button } from '@mantine/core';

interface Props {
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
}

export const DateButtonThisMonth: React.FC<Props> = ({
  setFromDate,
  setToDate,
}) => {
  return (
    <Button
      variant="transparent"
      onClick={() => {
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        start.setDate(1);
        setFromDate(start);

        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(1);
        end.setDate(end.getDate() - 1);
        setToDate(end);
      }}
      size="small"
    >
      Šis mėnuo
    </Button>
  );
};
