import { useRecoilState } from 'recoil';
import { Grid, Text, Title } from '@mantine/core';

import Link from '../../src/Link';
import { invoiceIdState } from '../../src/atoms';

export default function InvoiceEditHeader() {
  const [invoiceId] = useRecoilState(invoiceIdState);

  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={2}>
          {invoiceId ? 'Keisti sąskaitą faktūrą' : 'Sukurti sąskaitą faktūrą'}
        </Title>
      </Grid.Col>

      <Grid.Col span={12}>
        <Text>
          Pagalbinės informacijos apie sąskaitų faktūrų sukūrimą, keitimą ir
          kitą funkcionalumą galite rasti šiame straipsnyje{' '}
          <Link href="/straipsniai/saskaitos-fakturos">
            „Sąskaitų faktūrų išrašymas ir redagavimas“
          </Link>
        </Text>
      </Grid.Col>
    </Grid>
  );
}
