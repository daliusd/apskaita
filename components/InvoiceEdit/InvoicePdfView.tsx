import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useCopyToClipboard } from 'react-use';

import {
  messageSeverityState,
  messageTextState,
  pdfnameState,
  seriesIdState,
  seriesNameState,
} from '../../src/atoms';

export default function InvoicePdfView() {
  const [seriesName] = useRecoilState(seriesNameState);
  const [seriesId] = useRecoilState(seriesIdState);
  const [pdfname] = useRecoilState(pdfnameState);

  const router = useRouter();
  const [, setMessageText] = useRecoilState(messageTextState);
  const [, setMessageSeverity] = useRecoilState(messageSeverityState);
  const [isCopied, setIsCopied] = useCopyToClipboard();

  useEffect(() => {
    if (isCopied.value) {
      setMessageText('Nuoroda nukopijuota.');
      setMessageSeverity('success');
    }
  }, [isCopied.value, setMessageText, setMessageSeverity]);

  if (!pdfname) {
    return null;
  }

  const pdfUrl = `/api/pdf/${pdfname}/${seriesName}${seriesId
    .toString()
    .padStart(6, '0')}.pdf`;

  const fullUrl = `${process.env.NEXT_PUBLIC_URL}${pdfUrl}`;

  return (
    <>
      <Grid item xs={12}>
        <TextField
          variant="standard"
          label="PDF nuoroda"
          inputProps={{ 'aria-label': 'PDF nuoroda' }}
          value={fullUrl}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <Button
          variant="contained"
          color="primary"
          aria-label="PDF failas"
          onClick={() => {
            router.push(pdfUrl);
          }}
        >
          Atidaryti PDF failą
        </Button>
      </Grid>
      <Grid container item xs={6} justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          aria-label="Kopijuoti PDF nuorodą"
          onClick={() => {
            setIsCopied(fullUrl);
          }}
        >
          Kopijuoti PDF nuorodą
        </Button>
      </Grid>
    </>
  );
}
