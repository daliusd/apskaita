import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Grid,
  Group,
  Progress,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IInvoice } from '../../db/db';
import { getDateString } from '../../utils/date';
import { putInvoicepaid } from '../api/putInvoicepaid';

interface Props {
  invoices: IInvoice[];
  onChange: () => void;
}

export function InvoicesTable({ invoices, onChange }: Props) {
  const [selectedRows, setSelectedRows] = useState<number[]>(
    invoices.map((i) => i.id),
  );

  const [operationInProgress, setOperationInProgress] = useState(false);
  const [operationResult, setOperationResult] = useState('');
  const [operationProgress, setOperationProgress] = useState(0);

  const markAsPaid = async () => {
    setOperationInProgress(true);
    setOperationResult('');

    let processedCount = 0;
    let failureCount = 0;

    const step = 100.0 / invoices.length;
    for (const inv of invoices) {
      setOperationProgress((c) => c + step);
      if (inv.paid || !selectedRows.includes(inv.id)) {
        continue;
      }

      if (!(await putInvoicepaid(inv.id, true))) {
        failureCount++;
        continue;
      }

      processedCount++;
    }

    setOperationResult(
      `Sąskaitų pažymėta kaip apmokėtos: ${processedCount}` +
        (failureCount > 0 ? `. Nepavyko pažymėti: ${failureCount}` : ''),
    );
    setOperationInProgress(false);
    setSelectedRows([]);
    onChange();
  };

  return (
    <Grid>
      <Grid.Col span={12}>
        <Stack>
          <Text>
            Čia galite atlikti tą pačią operaciją su keliomis sąskaitomis
            faktūromis iš karto. Čia rodomos visos rastos sąskaitos faktūros
            pagal jūsų paieškos kriterijus ir jūs galite pasirinkti su kuriomis
            norite atlikti operaciją. PASTABA: šiuo metu funkcionalumas kuriamas
            ir daugiau operacijų bus pridėta ateityje.
          </Text>
          <Group>
            <Button
              aria-label="Pažymėti kaip apmokėtas"
              size="compact-sm"
              variant="outline"
              onClick={markAsPaid}
              disabled={operationInProgress}
            >
              Pažymėti kaip apmokėtas
            </Button>
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
