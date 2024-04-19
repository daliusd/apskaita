import { useRecoilState } from 'recoil';
import { Grid, Text, Title } from '@mantine/core';

import BuyerEmailInput from '../inputs/BuyerEmailInput';
import ExtraInput from './ExtraInput';
import InvoiceEditBuyer from './InvoiceEditBuyer';
import InvoiceEditDate from './InvoiceEditDate';
import InvoiceEditSeriesName from './InvoiceEditSeriesName';
import InvoiceEditType from './InvoiceEditType';
import IssuerInput from './IssuerInput';
import LanguageSelect from './LanguageSelect';
import Link from '../../src/Link';
import SellerInput from './SellerInput';
import SeriesIdInput from './SeriesIdInput';
import { invoiceIdState } from '../../src/atoms';

export default function InvoiceEditMain() {
  const [invoiceId] = useRecoilState(invoiceIdState);

  return (
    <Grid gutter={{ base: 12 }}>
      <Grid.Col span={12}>
        <Title order={3}>Pagrindinė informacija</Title>
      </Grid.Col>

      <Grid.Col span={12}>
        <InvoiceEditType />
      </Grid.Col>

      <Grid.Col span={6}>
        <InvoiceEditSeriesName />
      </Grid.Col>

      <Grid.Col span={6}>
        <SeriesIdInput />
      </Grid.Col>

      <Grid.Col span={6}>
        <InvoiceEditDate />
      </Grid.Col>

      <Grid.Col span={6}>
        <LanguageSelect />
      </Grid.Col>

      <Grid.Col span={12}>
        <SellerInput />
      </Grid.Col>

      <Grid.Col span={12}>
        <InvoiceEditBuyer />
      </Grid.Col>

      <Grid.Col span={12}>
        <BuyerEmailInput />
      </Grid.Col>

      <Grid.Col span={12}>
        <IssuerInput />
      </Grid.Col>

      <Grid.Col span={12}>
        <ExtraInput />
      </Grid.Col>
    </Grid>
  );
}
