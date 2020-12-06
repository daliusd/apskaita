import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { csrfToken } from 'next-auth/client';

export default function SignOut({ csrfToken }) {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ar tikrai norite atsijungti?
        </Typography>
        <Box>
          <form action={`/api/auth/signout`} method="POST">
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <Button type="submit" variant="contained" color="primary">
              Atsijungti
            </Button>
          </form>
        </Box>
      </Box>
    </Container>
  );
}

SignOut.getInitialProps = async (context) => {
  return {
    csrfToken: await csrfToken(context),
  };
};
