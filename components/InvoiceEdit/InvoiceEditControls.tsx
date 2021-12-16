import React from 'react';
import { useRecoilState } from 'recoil';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useSession } from 'next-auth/client';

import InvoiceEditChangeButton from './InvoiceEditChangeButton';
import InvoiceDeleteButton from '../inputs/InvoiceDeleteButton';
import InvoiceEditPaid from '../inputs/InvoiceEditPaid';
import InvoiceEditLocked from './InvoiceEditLocked';
import InvoiceEditSent from './InvoiceEditSent';
import SendInvoiceButton from './SendInvoiceButton';
import InvoicePdfView from './InvoicePdfView';
import { invoiceIdState, lockedState } from '../../src/atoms';

export default function InvoiceEditControls() {
  const [session] = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [locked] = useRecoilState(lockedState);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <InvoiceEditChangeButton />
      </Grid>

      <InvoicePdfView />

      {!!invoiceId && (
        <Grid item xs={12}>
          <Typography variant="body1" color="textSecondary" component="p">
            Ši sąskaita faktūra yra:
          </Typography>
        </Grid>
      )}

      {!!invoiceId && (
        <Grid item xs={12}>
          <InvoiceEditPaid />
          <InvoiceEditLocked />
          <InvoiceEditSent />
        </Grid>
      )}

      {gmailSend && <SendInvoiceButton />}

      <InvoiceDeleteButton invoiceId={invoiceId} disabled={locked} />
    </Grid>
  );
}
