import Grid from '@mui/material/Grid';
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
      <Grid item xs={3}>
        <DateButtonThisYear setFromDate={setFromDate} setToDate={setToDate} />
      </Grid>
      <Grid item xs={3}>
        <DateButtonPreviousYear
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </Grid>
      <Grid item xs={3}>
        <DateButtonThisMonth setFromDate={setFromDate} setToDate={setToDate} />
      </Grid>
      <Grid item xs={3}>
        <DateButtonPreviousMonth
          setFromDate={setFromDate}
          setToDate={setToDate}
        />
      </Grid>
    </>
  );
};
