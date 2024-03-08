import Button from '@mui/material/Button';

interface Props {
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
}

export const DateButtonPreviousMonth: React.FC<Props> = ({
  setFromDate,
  setToDate,
}) => {
  return (
    <Button
      variant="text"
      onClick={() => {
        const start = new Date();
        start.setUTCHours(0, 0, 0, 0);
        start.setDate(1);
        start.setMonth(start.getMonth() - 1);
        setFromDate(start);

        const end = new Date();
        end.setUTCHours(0, 0, 0, 0);
        end.setDate(1);
        end.setDate(end.getDate() - 1);
        setToDate(end);
      }}
      size="small"
    >
      Praeitas mėnuo
    </Button>
  );
};
