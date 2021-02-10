import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { useCopyClipboard } from 'react-recipes';

import { IContext, Context } from '../src/Store';

interface IProps {
  seriesName: string;
  seriesId: string;
  pdfname: string;
}

export default function InvoicePdfView({
  seriesName,
  seriesId,
  pdfname,
}: IProps) {
  const router = useRouter();
  const { dispatch } = useContext<IContext>(Context);
  const [isCopied, setIsCopied] = useCopyClipboard();

  useEffect(() => {
    if (isCopied) {
      dispatch({
        type: 'SET_MESSAGE',
        text: 'Nuoroda nukopijuota.',
        severity: 'success',
      });
    }
  }, [isCopied, dispatch]);

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
      <Grid container item xs={6} justify="flex-end">
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
