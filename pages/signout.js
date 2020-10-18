import React from 'react';
import { csrfToken } from 'next-auth/client';

export default function SignOut({ csrfToken }) {
  return (
    <div className="signout">
      <h1>Ar tikrai norite atsijungti?</h1>
      <form action={`/api/auth/signout`} method="POST">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <button type="submit">Atsijungti</button>
      </form>
    </div>
  );
}

SignOut.getInitialProps = async (context) => {
  return {
    csrfToken: await csrfToken(context),
  };
};
