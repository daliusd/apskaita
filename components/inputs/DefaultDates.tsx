import { Grid } from '@mantine/core';
import { DateButtonPreviousYear } from './DateButtonPreviousYear';
import { DateButtonThisYear } from './DateButtonThisYear';
import { DateButtonThisMonth } from './DateButtonThisMonth';
import { DateButtonPreviousMonth } from './DateButtonPreviousMonth';

interface Props {
  setFromDate: (date: Date) => void;
  setToDate: (date: Date) => void;
}

export const DefaultDates: React.FC<Props> = ({ setFromDate, setToDate }) => {
  return (
    <>
      <Grid.Col span={3}>
        <DateButtonThisYear setFromDate={setFromDate} setToDate={setToDate} />
      </Grid.Col>
      <Grid.Col span={3}>
        <DateButtonPreviousYear
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <DateButtonThisMonth setFromDate={setFromDate} setToDate={setToDate} />
      </Grid.Col>
      <Grid.Col span={3}>
        <DateButtonPreviousMonth
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </Grid.Col>
    </>
  );
};
