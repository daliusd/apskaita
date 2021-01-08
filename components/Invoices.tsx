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
import Typography from '@material-ui/core/Typography';
import useSWR from 'swr';

import { getDateString } from '../utils/date';

interface Props {
  limit?: number;
}

export default function Invoices({ limit }: Props) {
  const router = useRouter();
  const { data } = useSWR('/api/invoices' + (limit ? `?limit=${limit}` : ''));

  if (!data) return <LinearProgress />;

  if (!data.invoices.length) return <>Jūs neturite sąskaitų faktūrų.</>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Numeris</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Pirkėjas</TableCell>
            <TableCell>Suma (€)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.invoices.map((i) => (
            <TableRow
              key={i.id}
              hover
              onClick={() => {
                router.push(`/saskaitos/id/${i.id}`);
              }}
            >
              <TableCell component="th" scope="row">
                {i.seriesName}/{i.seriesId}
              </TableCell>
              <TableCell>{getDateString(i.created)}</TableCell>
              <TableCell>{i.buyer.split('\n')[0]}</TableCell>
              <TableCell>{i.price / 100}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
