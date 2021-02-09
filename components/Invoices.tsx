import React from 'react';
import { useRouter } from 'next/router';
import LinearProgress from '@material-ui/core/LinearProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import EditIcon from '@material-ui/icons/Edit';
import useSWR from 'swr';

import { getDateString } from '../utils/date';
import Link from '../src/Link';

interface Props {
  limit?: number;
}

export default function Invoices({ limit }: Props) {
  const router = useRouter();
  const { data, error } = useSWR(
    '/api/invoices' + (limit ? `?limit=${limit}` : ''),
  );

  if (error) return <>Klaida parsiunčiant sąskaitų faktūrų sąrašą.</>;
  if (!data) return <LinearProgress />;

  if (!data.invoices.length) return <>Jūs neturite sąskaitų faktūrų.</>;

  const openInvoice = (i) => {
    router.push(`/saskaitos/id/${i.id}`);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Numeris</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Pirkėjas</TableCell>
            <TableCell>Suma (€)</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.invoices.map((i) => (
            <TableRow key={i.id} hover>
              <TableCell
                component="th"
                scope="row"
                onClick={() => openInvoice(i)}
              >
                {i.seriesName}/{i.seriesId}
              </TableCell>
              <TableCell onClick={() => openInvoice(i)}>
                {getDateString(i.created)}
              </TableCell>
              <TableCell onClick={() => openInvoice(i)}>
                {i.buyer.split('\n')[0]}
              </TableCell>
              <TableCell onClick={() => openInvoice(i)}>
                {i.price / 100}
              </TableCell>
              <TableCell>
                <Link href={`/saskaitos/id/${i.id}`}>
                  <EditIcon />
                </Link>
                <Link
                  href={`/api/pdf/${i.pdfname}/${
                    i.seriesName
                  }${i.seriesId.toString().padStart(6, '0')}.pdf`}
                  color="secondary"
                >
                  <PictureAsPdfIcon />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
