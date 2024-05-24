import { Modal, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MultiEditModalContent } from './MultiEditModalContent';

interface Props {
  minDate?: number;
  maxDate?: number;
  seriesName?: string;
  buyer?: string;
  paid?: boolean;
  invoiceType?: string;
  onChange?: () => void;
  disabled: boolean;
}

export function MultiEditModal(props: Props) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Keisti rastas sąskaitas faktūras"
        size="auto"
      >
        <MultiEditModalContent {...props} />
      </Modal>

      <Button onClick={open} disabled={props.disabled}>
        Keisti rastas sąskaitas faktūras
      </Button>
    </>
  );
}
