import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import useSWR from 'swr';
import Link from '../../src/Link';
import Copyright from '../../src/Copyright';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Apie() {
  const { data, error } = useSWR('/api/initial', fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <LinearProgress />;

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Haiku.lt
        </Typography>
        <Link href="/" color="secondary">
          Grįžti į pagrindinį puslapį
        </Link>

        <Box>
          <TextField label="Gavėjas" value={data.email} />
        </Box>

        <Box>
          <Button type="submit" variant="contained" color="primary">
            Sukurti
          </Button>
        </Box>

        <Copyright />
      </Box>
    </Container>
  );
}
