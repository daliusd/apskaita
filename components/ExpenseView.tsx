import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Pageview from '@material-ui/icons/Pageview';
import CloudDownload from '@material-ui/icons/CloudDownload';

import { IExpense } from '../db/db';
import { getDateString } from '../utils/date';
import Link from '../src/Link';

interface Props {
  expense: IExpense;
}

const useStyles = makeStyles({
  root: {
    marginBottom: 12,
  },
});

export default function ExpenseView({ expense }: Props) {
  const classes = useStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h6" component="h1">
              {expense.description}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary" component="p">
              Data: {getDateString(expense.created)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary" component="p">
              Suma: {expense.price} €
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Grid container>
          <Grid item xs={12}>
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
                  Parsisiųsti
                </Button>
              </Link>
            )}
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
}
