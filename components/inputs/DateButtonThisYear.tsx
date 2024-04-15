import { Button } from '@mantine/core';

interface Props {
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
}

export const DateButtonThisYear: React.FC<Props> = ({
  setFromDate,
  setToDate,
}) => {
  return (
    <Button
      variant="transparent"
      onClick={() => {
        setFromDate(startOfThisYear());
        setToDate(endOfThisYear());
      }}
      size="small"
    >
      Šie metai
    </Button>
  );
};

function startOfThisYear() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setMonth(0);
  d.setDate(1);
  return d;
}

function endOfThisYear() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setMonth(0);
  d.setDate(31);
  d.setMonth(d.getMonth() + 11);
  return d;
}
