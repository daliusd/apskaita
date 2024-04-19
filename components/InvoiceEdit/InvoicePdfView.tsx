import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Button, Grid, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCopyToClipboard } from 'react-use';

import { pdfnameState, seriesIdState, seriesNameState } from '../../src/atoms';

export default function InvoicePdfView() {
  const [seriesName] = useRecoilState(seriesNameState);
  const [seriesId] = useRecoilState(seriesIdState);
  const [pdfname] = useRecoilState(pdfnameState);

  const router = useRouter();
  const [isCopied, setIsCopied] = useCopyToClipboard();

  useEffect(() => {
    if (isCopied.value) {
      notifications.show({
        message: 'Nuoroda nukopijuota.',
        color: 'green',
      });
    }
  }, [isCopied.value]);

  if (!pdfname) {
    return null;
  }

  const pdfUrl = `/api/pdf/${pdfname}/${seriesName}${seriesId
    .toString()
    .padStart(6, '0')}.pdf`;

  const fullUrl = `${process.env.NEXT_PUBLIC_URL}${pdfUrl}`;

  return (
    <>
      <Grid.Col span={12}>
        <TextInput
          label="PDF nuoroda"
          aria-label={'PDF nuoroda'}
          value={fullUrl}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Button
          variant="filled"
          aria-label="PDF failas"
          onClick={() => {
            router.push(pdfUrl);
          }}
        >
          Atidaryti PDF failą
        </Button>
      </Grid.Col>
      <Grid.Col span={6}>
        <Group justify="flex-end">
          <Button
            variant="filled"
            aria-label="Kopijuoti PDF nuorodą"
            onClick={() => {
              setIsCopied(fullUrl);
            }}
          >
            Kopijuoti PDF nuorodą
          </Button>
        </Group>
      </Grid.Col>
    </>
  );
}
