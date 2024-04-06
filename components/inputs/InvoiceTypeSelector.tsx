import { Radio, Group } from '@mantine/core';

type IInvoiceType = 'standard' | 'proforma' | 'credit';

interface IProps {
  invoiceType: IInvoiceType;
  onChange: (value: IInvoiceType) => void;
  disabled: boolean;
}

export default function InvoiceTypeSelector({
  invoiceType,
  onChange,
  disabled,
}: IProps) {
  return (
    <Radio.Group
      aria-label="Sąskaitos faktūros tipas"
      label="Sąskaitos faktūros tipas"
      name="invoiceType"
      value={invoiceType}
      onChange={onChange}
    >
      <Group mt="xs">
        <Radio value="standard" label="Standartinė" disabled={disabled} />
        <Radio value="proforma" label="Išankstinė" disabled={disabled} />
        <Radio value="credit" label="Kreditinė" disabled={disabled} />
      </Group>
    </Radio.Group>
  );
}
