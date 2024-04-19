import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, Grid, Group, Text, Title } from '@mantine/core';
import { IconEdit, IconFileTypePdf, IconCopy } from '@tabler/icons-react';

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
    <Card shadow="sm" withBorder mb={12}>
      <Grid gutter={{ base: 24 }}>
        <Grid.Col span={12}>
          <Title order={4} onClick={() => openInvoice(invoice)}>
            {invoice.invoiceType === 'proforma'
              ? 'Išankstinė'
              : invoice.invoiceType === 'credit'
                ? 'Kreditinė'
                : 'Standartinė'}{' '}
            SF {invoice.seriesName}/{invoice.seriesId} (
            {getDateString(invoice.created)})
          </Title>
        </Grid.Col>
        <Grid.Col span={12}>
          <Grid gutter={{ base: 3 }}>
            <Grid.Col span={12}>
              <Text>Pirkėjas: {invoice.buyer.split('\n')[0]}</Text>
            </Grid.Col>
            <Grid.Col span={12}>
              <Text>Kaina: {invoice.price / 100} €</Text>
            </Grid.Col>
          </Grid>
        </Grid.Col>
        <Grid.Col span={12}>
          <Group>
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
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Group gap="sm">
            <Link href={`/saskaitos/id/${invoice.id}`}>
              <Button
                aria-label={`Keisti SF ${invoice.id}`}
                size="compact-sm"
                variant="outline"
                leftSection={<IconEdit />}
              >
                Keisti
              </Button>
            </Link>

            <Link
              href={`/api/pdf/${invoice.pdfname}/${
                invoice.seriesName
              }${invoice.seriesId.toString().padStart(6, '0')}.pdf`}
            >
              <Button
                aria-label={`Peržiūrėti PDF ${invoice.id}`}
                size="compact-sm"
                variant="outline"
                leftSection={<IconFileTypePdf />}
              >
                Peržiūrėti
              </Button>
            </Link>

            <Link
              href={`/saskaitos/nauja?sourceId=${invoice.id}&invoiceType=${invoice.invoiceType}`}
            >
              <Button
                aria-label={`Nauja SF šios pagrindu ${invoice.id}`}
                size="compact-sm"
                variant="outline"
                leftSection={<IconCopy />}
              >
                Nauja SF šios pagrindu
              </Button>
            </Link>
          </Group>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
