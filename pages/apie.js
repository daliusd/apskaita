import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '../src/Link';
import Copyright from '../src/Copyright';

export default function Apie() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Haiku.lt
        </Typography>
        <Link href="/" color="secondary">
          Grįžti į pagrindinį puslapį
        </Link>
        <Copyright />
      </Box>
    </Container>
  );
}
