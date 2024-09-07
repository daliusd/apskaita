import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Grid,
  Group,
  NumberInput,
  Progress,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { IInvoice } from '../../db/db';
import { getDateString, getMsSinceEpoch } from '../../utils/date';
import { putInvoicepaid } from '../api/putInvoicepaid';
import { getInvoiceBySourceId } from '../api/getInvoiceBySourceId';
import { postInvoices } from '../api/postInvoices';
import { putInvoicespdf } from '../api/putInvoicespdf';
import { postInvoicemailer } from '../api/postInvoicemailer';
import { getInvoice } from '../api/getInvoice';
import { postInvoicegdrive } from '../api/postInvoicegdrive';
import { putInvoices } from '../api/putInvoices';
import Link from '../../src/Link';
import { runExtraInputProgram } from '../utils/runExtraInputProgram';

interface Props {
  invoices: IInvoice[];
  onChange: () => void;
}

type OpResult = 'skip' | 'success' | 'failure';

export function InvoicesTable({ invoices, onChange }: Props) {
  const { data: session } = useSession();
  const gmailSend =
    session && (session as unknown as { gmailSend: boolean }).gmailSend;
  const gdrive = session && (session as unknown as { gdrive: boolean }).gdrive;
  const { data: extraInputProgramData } = useSWR(
    '/api/settings/extrainputprogram',
  );
  const extraInputProgram = extraInputProgramData?.value as string;

  const [selectedRows, setSelectedRows] = useState<number[]>(
    invoices.map((i) => i.id),
  );

  const [lineItemCount, setLineItemCount] = useState<number>(1);

  const [operationInProgress, setOperationInProgress] = useState(false);
  const [operationResult, setOperationResult] = useState('');
  const [operationProgress, setOperationProgress] = useState(0);

  const processAllInvoices = async (
    invoiceOperation: (inv: IInvoice) => Promise<OpResult>,
    operationResult: (successCount: number, failureCount: number) => string,
  ) => {
    setOperationInProgress(true);
    setOperationResult('');

    let successCount = 0;
    let failureCount = 0;

    const step = 100.0 / invoices.length;
    for (const inv of invoices) {
      setOperationProgress((c) => c + step);

      if (!selectedRows.includes(inv.id)) {
        continue;
      }

      const result = await invoiceOperation(inv);
      if (result === 'failure') {
        failureCount++;
      } else if (result === 'success') {
        successCount++;
      }
    }

    setOperationResult(operationResult(successCount, failureCount));
    setOperationInProgress(false);
    setSelectedRows([]);
    onChange();
  };

  const newBasedOnOld = async () => {
    await processAllInvoices(
      async (inv: IInvoice) => {
        const { success, invoice } = await getInvoiceBySourceId(inv.id);
        if (!success) {
          return 'failure';
        }
        invoice.created = getMsSinceEpoch(new Date());

        if (extraInputProgram?.startsWith('// AUTO')) {
          const result = await runExtraInputProgram({
            lineItems: invoice.lineItems,
            invoiceType: invoice.invoiceType,
            seriesName: invoice.seriesName,
            seriesId: invoice.seriesId.toString(),
            invoiceDate: new Date(invoice.created),
            language: invoice.language,
            seller: invoice.seller,
            buyer: invoice.buyer,
            email: invoice.email,
            issuer: invoice.issuer,
            extraInputProgram,
          });
          invoice.extra = result as string;
        }

        const newInvoice = await postInvoices(invoice, '');
        if (!newInvoice.success) {
          return 'failure';
        }

        const newInvoicePdfSuccess = await putInvoicespdf(newInvoice.invoiceId);
        if (!newInvoicePdfSuccess) {
          return 'failure';
        }

        return 'success';
      },
      (successCount, failureCount) =>
        `Sukurta naujų sąskaitų senų pagrindu: ${successCount}` +
        (failureCount > 0 ? `. Nepavyko sukurti: ${failureCount}` : ''),
    );
  };

  const sendNotSent = async () => {
    await processAllInvoices(
      async (inv: IInvoice) => {
        if (inv.sent || !inv.email) {
          return 'skip';
        }

        if (!(await postInvoicemailer(inv.id, inv.email)).success) {
          return 'failure';
        }

        return 'success';
      },
      (successCount, failureCount) =>
        `Išsiųsta sąskaitų: ${successCount}` +
        (failureCount > 0 ? `. Nepavyko išsiųsti: ${failureCount}` : ''),
    );
  };

  const markAsPaid = async () => {
    await processAllInvoices(
      async (inv: IInvoice) => {
        if (inv.paid) {
          return 'skip';
        }

        if (!(await putInvoicepaid(inv.id, true))) {
          return 'failure';
        }

        return 'success';
      },
      (successCount, failureCount) =>
        `Sąskaitų pažymėta kaip apmokėtos: ${successCount}` +
        (failureCount > 0 ? `. Nepavyko pažymėti: ${failureCount}` : ''),
    );
  };

  const saveToGdrive = async () => {
    await processAllInvoices(
      async (inv: IInvoice) => {
        const { success, invoice } = await getInvoice(inv.id);
        if (!success) {
          return 'failure';
        }

        if (!(await postInvoicegdrive(invoice.id)).success) {
          return 'failure';
        }

        return 'success';
      },
      (successCount, failureCount) =>
        `Sąskaitų išsaugotą į Google Drive: ${successCount}` +
        (failureCount > 0 ? `. Nepavyko išsaugoti: ${failureCount}` : ''),
    );
  };

  const changeLineItemsCount = async () => {
    await processAllInvoices(
      async (inv: IInvoice) => {
        const { success, invoice } = await getInvoice(inv.id);
        if (!success) {
          return 'failure';
        }

        if (invoice.lineItems.length !== 1) {
          return 'failure';
        }

        invoice.lineItems[0].amount = lineItemCount;

        const item = invoice.lineItems[0];
        invoice.price = item.price * item.amount;
        invoice.vat =
          (item.price - Math.round(item.price / (1.0 + item.vat / 100))) *
          item.amount;

        const updatedInvoice = await putInvoices(inv.id, invoice);
        if (!updatedInvoice.success) {
          return 'failure';
        }

        const newInvoicePdfSuccess = await putInvoicespdf(
          updatedInvoice.invoiceId,
        );
        if (!newInvoicePdfSuccess) {
          return 'failure';
        }

        return 'success';
      },
      (successCount, failureCount) =>
        `Pakeista sąskaitų: ${successCount}` +
        (failureCount > 0 ? `. Nepavyko pakeisti: ${failureCount}` : ''),
    );
  };

  return (
    <Grid>
      <Grid.Col span={12}>
        <Stack>
          <Text>
            Čia galite atlikti tą pačią operaciją su keliomis sąskaitomis
            faktūromis iš karto. Čia rodomos visos rastos sąskaitos faktūros
            pagal jūsų paieškos kriterijus ir jūs galite pasirinkti su kuriomis
            norite atlikti operaciją. Daugiau informacijos galima rasti
            straipsnyje{' '}
            <Link
              c="inherit"
              href="/straipsniai/keliu-saskaitu-keitimas"
              underline="always"
              target="_blank"
            >
              „Kelių sąskaitų keitimas“
            </Link>
            .
          </Text>
          <Group>
            <Button
              aria-label="Sukurti naujas sąskaitas senų pagrindu"
              size="compact-sm"
              variant="outline"
              onClick={newBasedOnOld}
              disabled={operationInProgress}
            >
              Sukurti naujas sąskaitas senų pagrindu
            </Button>

            <Button
              aria-label="Išsiųsti neišsiųstas"
              size="compact-sm"
              variant="outline"
              onClick={sendNotSent}
              disabled={operationInProgress || !gmailSend}
            >
              Išsiųsti neišsiųstas
            </Button>

            <Button
              aria-label="Pažymėti kaip apmokėtas"
              size="compact-sm"
              variant="outline"
              onClick={markAsPaid}
              disabled={operationInProgress}
            >
              Pažymėti kaip apmokėtas
            </Button>

            <Button
              aria-label="Išsaugoti į Google Drive"
              size="compact-sm"
              variant="outline"
              onClick={saveToGdrive}
              disabled={operationInProgress || !gdrive}
            >
              Išsaugoti į Google Drive
            </Button>
          </Group>
          <Group>
            <Button
              aria-label="Pakeisti prekių/paslaugų skaičių į"
              size="compact-sm"
              variant="outline"
              onClick={changeLineItemsCount}
              disabled={operationInProgress}
            >
              Pakeisti prekių/paslaugų skaičių į
            </Button>

            <NumberInput
              value={lineItemCount}
              onChange={(value) => {
                if (typeof value === 'number') {
                  setLineItemCount(value);
                }
              }}
            />
          </Group>

          {operationInProgress && <Progress value={operationProgress} />}
          {operationResult && (
            <Alert
              variant="light"
              color="blue"
              title="Operacija baigta"
              data-testid="operation-result"
            >
              {operationResult}
            </Alert>
          )}

          <Text data-testid="invoiceCount">
            Sąskaitų faktūrų: {invoices.length}. Pažymėta: {selectedRows.length}
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    aria-label="Pasirinkti"
                    data-testid="invoice-check-all"
                    checked={selectedRows.length > 0}
                    onChange={(event) => {
                      if (selectedRows.length > 0) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(invoices.map((i) => i.id));
                      }
                    }}
                  />
                </Table.Th>

                <Table.Th>SF</Table.Th>
                <Table.Th>Pirkėjas</Table.Th>
                <Table.Th>Data</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoices.map((inv) => (
                <Table.Tr
                  key={inv.id}
                  data-testid={`table-row-${inv.id}`}
                  bg={
                    selectedRows.includes(inv.id)
                      ? 'var(--mantine-color-blue-light)'
                      : undefined
                  }
                >
                  <Table.Td>
                    <Checkbox
                      aria-label="Pasirinkti"
                      data-testid={`invoice-check-${inv.id}`}
                      checked={selectedRows.includes(inv.id)}
                      onChange={(event) =>
                        setSelectedRows(
                          event.currentTarget.checked
                            ? [...selectedRows, inv.id]
                            : selectedRows.filter((id) => id !== inv.id),
                        )
                      }
                    />
                  </Table.Td>
                  <Table.Td>
                    {inv.seriesName}/{inv.seriesId}
                  </Table.Td>
                  <Table.Td>{inv.buyer.split('\n')[0]}</Table.Td>
                  <Table.Td>{getDateString(inv.created)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
