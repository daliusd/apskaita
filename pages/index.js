import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Link from '../src/Link';
import Copyright from '../src/Copyright';
import { signIn, signOut, useSession } from 'next-auth/client';

export default function Index() {
  const [session, loading] = useSession();
  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Haiku.lt
        </Typography>
        <Link href="/about" color="secondary">
          Eiti į Apie puslapį
        </Link>
        {!session && (
          <>
            <br />
            <Button
              onClick={(e) => {
                signIn('google');
              }}
              variant="contained"
              color="primary"
            >
              Prisijungti
            </Button>
          </>
        )}
        {session && (
          <>
            <br /> Prisijungęs kaip {session.user.email} <br />
            <Button
              onClick={() => {
                signOut();
              }}
              variant="contained"
              color="primary"
            >
              Atsijungti
            </Button>
          </>
        )}
        <Copyright />
      </Box>
    </Container>
  );
}
