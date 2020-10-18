import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

const options = {
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Providers.Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Add logic here to look up the user from the credentials supplied
        const user = {
          id: 1,
          name: credentials.username,
          email: `${credentials.username}@haiku.lt`,
        };

        if (
          credentials.username === process.env.CRED_USERNAME &&
          credentials.password === process.env.CRED_PASSWORD
        ) {
          return Promise.resolve(user);
        } else {
          return Promise.resolve(null);
        }
      },
    }),
  ],

  session: {
    jwt: true,
  },

  pages: {
    signOut: '/signout',
  },

  debug: false,
};

export default (req, res) => NextAuth(req, res, options);
