import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';

import { IInvoice } from '../db/db';
import { getDateString } from '../utils/date';
import Link from '../src/Link';
import InvoicePaidCheckbox from './inputs/InvoicePaidCheckbox';
import InvoiceLockedCheckbox from './inputs/InvoiceLockedCheckbox';
import InvoiceSentCheckbox from './inputs/InvoiceSentCheckbox';

interface Props {
  invoice: IInvoice;
  onChange: () => void;
}

export default function InvoiceView({ invoice, onChange }: Props) {
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
    <Card sx={{ marginBottom: '12px' }} elevation={3}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              component="h1"
              onClick={() => openInvoice(invoice)}
            >
              {invoice.invoiceType === 'proforma'
                ? 'Išankstinė'
                : 'Standartinė'}{' '}
              SF {invoice.seriesName}/{invoice.seriesId} (
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
            <InvoicePaidCheckbox
              invoiceId={invoice.id.toString()}
              paid={paid}
              setPaid={(v) => {
                setPaid(v);
                onChange();
              }}
            />
            <InvoiceLockedCheckbox
              invoiceId={invoice.id.toString()}
              locked={locked}
              setLocked={(v) => {
                setLocked(v);
                onChange();
              }}
            />
            <InvoiceSentCheckbox
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

            <Link
              href={`/saskaitos/nauja?sourceId=${invoice.id}&invoiceType=${invoice.invoiceType}`}
            >
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
