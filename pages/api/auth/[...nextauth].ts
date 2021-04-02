import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import * as Sentry from '@sentry/node';
import { Database } from 'sqlite';
import { openDb } from '../../../db/db';

const GOOGLE_AUTHORIZATION_URL =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    prompt: 'consent',
    access_type: 'offline',
    response_type: 'code',
  });

async function refreshAccessToken(token) {
  try {
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: process.env.GOOGLE_ID,
        client_secret: process.env.GOOGLE_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    Sentry.captureException(error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

const options = {
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorizationUrl: GOOGLE_AUTHORIZATION_URL,
      scope:
        'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file',
    }),
    {
      id: 'googleEx',
      name: 'Google Experimental',
      type: 'oauth',
      version: '2.0',
      scope:
        'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file',
      params: { grant_type: 'authorization_code' },
      accessTokenUrl: 'https://accounts.google.com/o/oauth2/token',
      requestTokenUrl: 'https://accounts.google.com/o/oauth2/auth',
      authorizationUrl: GOOGLE_AUTHORIZATION_URL,
      profileUrl: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
      async profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    },
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
          email: credentials.username,
        };

        if (
          process.env.CRED_PASSWORD &&
          credentials.username &&
          credentials.password === process.env.CRED_PASSWORD
        ) {
          return Promise.resolve(user);
        } else {
          return Promise.resolve(null);
        }
      },
    }),
  ],

  secret: process.env.SECRET,

  session: {
    jwt: true,
  },

  pages: {
    signOut: '/atsijungti',
  },

  callbacks: {
    async signIn(user) {
      let db: Database;
      try {
        db = await openDb(user.email);
      } finally {
        await db.close();
      }

      return true;
    },
    async jwt(token, user, account) {
      // Initial sign in
      if (account && user && account.accessToken) {
        return {
          accessToken: account.accessToken,
          accessTokenExpires: Date.now() + account.expires_in * 1000,
          refreshToken: account.refresh_token,
          gdrive: account.scope.includes(
            'https://www.googleapis.com/auth/drive.file',
          ),
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (
        token.accessTokenExpires === undefined ||
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session(session, token) {
      if (token) {
        session.user = token.user !== undefined ? token.user : session.user;
        session.accessToken = token.accessToken;
        session.gdrive = token.gdrive;
        session.error = token.error;
      }

      return session;
    },
  },

  debug: true,
};

export default (req, res) => NextAuth(req, res, options);
