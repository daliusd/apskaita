import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Pageview from '@mui/icons-material/Pageview';
import CloudDownload from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import ExpenseEditDialog from './ExpenseEditDialog';
import { IExpense } from '../../db/db';
import { getDateString } from '../../utils/date';
import Link from '../../src/Link';
import { messageSeverityState, messageTextState } from '../../src/atoms';

interface Props {
  expense: IExpense;
  onChange: () => void;
}

export default function ExpenseView(props: Props) {
  const { expense } = props;
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [expenseEditOpen, setExpenseEditOpen] = useState(false);

  const handleDelete = async () => {
    let response: Response;
    try {
      response = await fetch('/api/expenses/' + expense.id, {
        method: 'DELETE',
      });
    } catch {}

    if (!response || !response.ok || !(await response.json()).success) {
      setMessageText('Klaida trinant išlaidų įrašą.');
      setMessageSeverity('error');
      return;
    }

    setMessageText('Išlaidų įrašas ištrintas.');
    setMessageSeverity('info');
    props.onChange();
  };

  return (
    <Card sx={{ marginBottom: '12px' }} elevation={3}>
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
