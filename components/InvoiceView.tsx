import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import EditIcon from '@material-ui/icons/Edit';

import { IInvoice } from '../db/db';
import { getDateString } from '../utils/date';
import Link from '../src/Link';
import InvoiceEditPaid from './InvoiceEditPaid';

interface Props {
  invoice: IInvoice;
}

const useStyles = makeStyles({
  root: {
    marginBottom: 12,
  },
});

export default function InvoiceView({ invoice }: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [paid, setPaid] = useState(invoice.paid === 1);

  const openInvoice = (i) => {
    router.push(`/saskaitos/id/${i.id}`);
  };

  return (
    <Card className={classes.root}>
      <CardContent>
        <Typography
          variant="h6"
          component="h1"
          onClick={() => openInvoice(invoice)}
        >
          {invoice.seriesName}/{invoice.seriesId} (
          {getDateString(invoice.created)})
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Pirkėjas: {invoice.buyer.split('\n')[0]}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          Kaina: {invoice.price / 100} €
        </Typography>
        <InvoiceEditPaid
          invoiceId={invoice.id.toString()}
          paid={paid}
          setPaid={setPaid}
        />
      </CardContent>
      <CardActions>
        <Link href={`/saskaitos/id/${invoice.id}`}>
          <Button
            aria-label={`Keisti SF ${invoice.id}`}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
          >
            Keisti
          </Button>
        </Link>

        <Link
          href={`/api/pdf/${invoice.pdfname}/${
            invoice.seriesName
          }${invoice.seriesId.toString().padStart(6, '0')}.pdf`}
          color="secondary"
        >
          <Button
            aria-label={`Peržiūrėti PDF ${invoice.id}`}
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
          >
            Peržiūrėti
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}
