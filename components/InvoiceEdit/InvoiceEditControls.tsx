import { useRecoilState } from 'recoil';
import { Grid, Group, Text, Title } from '@mantine/core';
import { useSession } from 'next-auth/react';

import InvoiceEditChangeButton from './InvoiceEditChangeButton';
import InvoiceDeleteButton from '../inputs/InvoiceDeleteButton';
import InvoiceEditPaid from '../inputs/InvoiceEditPaid';
import InvoiceEditLocked from './InvoiceEditLocked';
import InvoiceEditSent from './InvoiceEditSent';
import SendInvoiceButton from './SendInvoiceButton';
import InvoicePdfView from './InvoicePdfView';
import { invoiceIdState, lockedState } from '../../src/atoms';

export default function InvoiceEditControls() {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;
  const [invoiceId] = useRecoilState(invoiceIdState);
  const [locked] = useRecoilState(lockedState);

  return (
    <Grid gutter={{ base: 12 }} justify="space-between">
      <Grid.Col span={12}>
        <Title order={3}>Sąskaitos valdymas</Title>
      </Grid.Col>
      <Grid.Col span={12}>
        <InvoiceEditChangeButton />
      </Grid.Col>

      <InvoicePdfView />

      {!!invoiceId && (
        <Grid.Col span={12}>
          <Text>Ši sąskaita faktūra yra:</Text>
        </Grid.Col>
      )}

      {!!invoiceId && (
        <Grid.Col span={12}>
          <Group>
            <InvoiceEditPaid />
            <InvoiceEditLocked />
            <InvoiceEditSent />
          </Group>
        </Grid.Col>
      )}

      {gmailSend && <SendInvoiceButton />}

      <Grid.Col span={12}>
        <InvoiceDeleteButton invoiceId={invoiceId} disabled={locked} />
      </Grid.Col>
    </Grid>
  );
}
