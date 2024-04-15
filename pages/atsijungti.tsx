import { Box, Button, Title } from '@mantine/core';
import { getCsrfToken } from 'next-auth/react';

export default function SignOut({ csrfToken }) {
  return (
    <Box my={24}>
      <Title order={1}>Ar tikrai norite atsijungti?</Title>
      <Box>
        <form action={`/api/auth/signout`} method="POST">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <Button type="submit" variant="filled">
            Atsijungti
          </Button>
        </form>
      </Box>
    </Box>
  );
}

SignOut.getInitialProps = async (context) => {
  return {
    csrfToken: await getCsrfToken(context),
  };
};
