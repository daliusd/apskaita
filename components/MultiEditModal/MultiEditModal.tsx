import { Modal, Button, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MultiEditModalContent } from './MultiEditModalContent';
import { usePlan } from '../../src/usePlan';

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
  const { isFree } = usePlan();
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

      {isFree && (
        <Tooltip label="Šis funkcionalumas reikalauja Pro plano">
          <Button onClick={open} disabled={true}>
            Keisti rastas sąskaitas faktūras
          </Button>
        </Tooltip>
      )}
      {!isFree && (
        <Button onClick={open} disabled={props.disabled}>
          Keisti rastas sąskaitas faktūras
        </Button>
      )}
    </>
  );
}
