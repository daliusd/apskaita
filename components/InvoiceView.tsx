import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { IInvoice } from '../db/db';
import { getDateString } from '../utils/date';
import Link from '../src/Link';
import InvoiceEditPaid from './InvoiceEditPaid';
import InvoiceEditLocked from './InvoiceEditLocked';
import InvoiceEditSent from './InvoiceEditSent';

interface Props {
  invoice: IInvoice;
  onChange: () => void;
}

const useStyles = makeStyles({
  root: {
    marginBottom: 12,
  },
});

export default function InvoiceView({ invoice, onChange }: Props) {
  const classes = useStyles();
  const router = useRouter();
  const [paid, setPaid] = useState(invoice.paid === 1);
  const [locked, setLocked] = useState(invoice.locked === 1);
  const [sent, setSent] = useState(invoice.sent === 1);

  useEffect(() => {
    setPaid(invoice.paid === 1);
  }, [invoice.paid, onChange]);

  useEffect(() => {
    setLocked(invoice.locked === 1);
  }, [invoice.locked, onChange]);

  useEffect(() => {
    setSent(invoice.sent === 1);
  }, [invoice.sent, onChange]);

  const openInvoice = (i) => {
    router.push(`/saskaitos/id/${i.id}`);
  };

  return (
    <Card className={classes.root} elevation={3}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              component="h1"
              onClick={() => openInvoice(invoice)}
            >
              {invoice.seriesName}/{invoice.seriesId} (
              {getDateString(invoice.created)})
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary" component="p">
              Pirkėjas: {invoice.buyer.split('\n')[0]}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary" component="p">
              Kaina: {invoice.price / 100} €
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <InvoiceEditPaid
              invoiceId={invoice.id.toString()}
              paid={paid}
              setPaid={(v) => {
                setPaid(v);
                onChange();
              }}
            />
            <InvoiceEditLocked
              invoiceId={invoice.id.toString()}
              locked={locked}
              setLocked={(v) => {
                setLocked(v);
                onChange();
              }}
            />
            <InvoiceEditSent
              invoiceId={invoice.id.toString()}
              sent={sent}
              setSent={(v) => {
                setSent(v);
                onChange();
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Grid container>
          <Grid item xs={12}>
            <Link href={`/saskaitos/id/${invoice.id}`}>
              <Button
                aria-label={`Keisti SF ${invoice.id}`}
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
                color="primary"
                startIcon={<PictureAsPdfIcon />}
              >
                Peržiūrėti
              </Button>
            </Link>

            <Link href={`/saskaitos/nauja?sourceId=${invoice.id}`}>
              <Button
                aria-label={`Nauja SF šios pagrindu ${invoice.id}`}
                color="primary"
                startIcon={<FileCopyIcon />}
              >
                Nauja SF šios pagrindu
              </Button>
            </Link>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
}
