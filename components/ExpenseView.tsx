import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Pageview from '@material-ui/icons/Pageview';
import CloudDownload from '@material-ui/icons/CloudDownload';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import ExpenseEditDialog from './ExpenseEditDialog';
import { IExpense } from '../db/db';
import { getDateString } from '../utils/date';
import Link from '../src/Link';
import { IContext, Context } from '../src/Store';

interface Props {
  expense: IExpense;
  onChange: () => void;
}

const useStyles = makeStyles({
  root: {
    marginBottom: 12,
  },
});

export default function ExpenseView(props: Props) {
  const { expense } = props;
  const classes = useStyles();
  const { dispatch } = useContext<IContext>(Context);
  const [expenseEditOpen, setExpenseEditOpen] = useState(false);

  const handleDelete = async () => {
    const response = await fetch('/api/expenses/' + expense.id, {
      method: 'DELETE',
    });

    if (!response.ok || !(await response.json()).success) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Klaida trinant išlaidų įrašą.',
        severity: 'error',
      });
      return;
    }

    dispatch({
      type: 'SET_MESSAGE',
      text: 'Išlaidų įrašas ištrintas.',
      severity: 'info',
    });
    props.onChange();
  };

  return (
    <Card className={classes.root} elevation={3}>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h6" component="h1">
              {expense.description}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" color="textSecondary" component="p">
              Data: {getDateString(expense.created)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" color="textSecondary" component="p">
              Suma: {expense.price} €
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Grid container>
          <Grid item xs={12}>
            <Button
              aria-label={`Keisti`}
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setExpenseEditOpen(true)}
            >
              Keisti
            </Button>

            {expense.webViewLink && (
              <Link href={expense.webViewLink} color="secondary">
                <Button
                  aria-label={`Peržiūrėti išlaidų dokumentą`}
                  color="primary"
                  startIcon={<Pageview />}
                >
                  Peržiūrėti
                </Button>
              </Link>
            )}
            {expense.webContentLink && (
              <Link href={expense.webContentLink} color="secondary">
                <Button
                  aria-label={`Atsisiųsti išlaidų dokumentą`}
                  color="primary"
                  startIcon={<CloudDownload />}
                >
                  Atsisiųsti
                </Button>
              </Link>
            )}
            <Button
              aria-label={`Ištrinti išlaidų įrašą`}
              color="secondary"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Ištrinti
            </Button>
          </Grid>
        </Grid>
      </CardActions>

      {expenseEditOpen && (
        <ExpenseEditDialog
          expense={expense}
          onClose={() => setExpenseEditOpen(false)}
          onChange={props.onChange}
        />
      )}
    </Card>
  );
}
