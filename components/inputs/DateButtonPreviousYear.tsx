import { Button } from '@mantine/core';

interface Props {
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
}

export const DateButtonPreviousYear: React.FC<Props> = ({
  setFromDate,
  setToDate,
}) => {
  return (
    <Button
      variant="subtle"
      size="compact-sm"
      onClick={() => {
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        start.setMonth(0);
        start.setDate(1);
        start.setFullYear(start.getFullYear() - 1);
        setFromDate(start);

        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);
        end.setMonth(0);
        end.setDate(31);
        end.setMonth(end.getMonth() + 11);
        end.setFullYear(end.getFullYear() - 1);
        setToDate(end);
      }}
    >
      Praeiti metai
    </Button>
  );
};
