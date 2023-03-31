import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { getCsrfToken } from 'next-auth/react';

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
    csrfToken: await getCsrfToken(context),
  };
};
