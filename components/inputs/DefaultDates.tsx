import { Grid, Group } from '@mantine/core';
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
      <Grid.Col span={12}>
        <Group justify="space-between">
          <DateButtonThisYear setFromDate={setFromDate} setToDate={setToDate} />
          <DateButtonPreviousYear
            setFromDate={setFromDate}
            setToDate={setToDate}
          />
          <DateButtonThisMonth
            setFromDate={setFromDate}
            setToDate={setToDate}
          />
          <DateButtonPreviousMonth
            setFromDate={setFromDate}
            setToDate={setToDate}
          />
        </Group>
      </Grid.Col>
    </>
  );
};
