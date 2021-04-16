import React, { useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SvgIcon from '@material-ui/core/SvgIcon';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { signIn, signOut, useSession } from 'next-auth/client';
import { useLocalStorage } from 'react-recipes';
import * as Sentry from '@sentry/browser';

import Copyright from './Copyright';
import Link from './Link';
import { Context, IContext } from '../src/Store';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    justifyContent: 'space-between',
  },
  toolbarTitle: {},
  toolbarSecondary: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  toolbarLink: {
    padding: theme.spacing(1),
  },
  google: {
    textTransform: 'none',
  },
}));

const Layout: React.FC = ({ children }) => {
  const classes = useStyles();
  const [session, loading] = useSession();
  const { state, dispatch } = useContext<IContext>(Context);
  const [experiments] = useLocalStorage('experiments', '');

  useEffect(() => {
    if (
      ((session as unknown) as { error: string })?.error ===
      'RefreshAccessTokenError'
    ) {
      signIn(experiments.includes('gmail') ? 'googleEx' : 'google');
    }
  }, [session, experiments]);

  useEffect(() => {
    if (session) {
      Sentry.setUser({ email: session.user.email });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  const handleMessageClose = () => {
    dispatch({ type: 'HIDE_MESSAGE' });
  };

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Toolbar className={classes.toolbar}>
            <Typography
              variant="h4"
              component="h1"
              noWrap
              className={classes.toolbarTitle}
            >
              <Link href="/" color="secondary">
                <img
                  src="/haikulogo.svg"
                  alt="Haiku.lt"
                  width="192"
                  height="64"
                />
              </Link>
            </Typography>
            {!loading && !session && (
              <Button
                className={classes.google}
                startIcon={
                  <SvgIcon viewBox="0 0 46 46">
                    <g
                      id="logo_googleg_48dp"
                      transform="matrix(1.8423 0 0 1.8423 6.4196 7.1087)"
                      fill="none"
                      fillRule="evenodd"
                    >
                      <path
                        id="Shape"
                        d="m17.64 9.2045c0-0.63818-0.05727-1.2518-0.16364-1.8409h-8.4764v3.4814h4.8436c-0.20864 1.125-0.84273 2.0782-1.7959 2.7164v2.2582h2.9086c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z"
                        fill="#4285f4"
                      />
                      <path
                        id="path42"
                        d="m9 18c2.43 0 4.4673-0.80591 5.9564-2.1805l-2.9086-2.2582c-0.80591 0.54-1.8368 0.85909-3.0477 0.85909-2.3441 0-4.3282-1.5832-5.0359-3.7105h-3.0068v2.3318c1.4809 2.9414 4.5245 4.9582 8.0427 4.9582z"
                        fill="#34a853"
                      />
                      <path
                        id="path44"
                        d="m3.9641 10.71c-0.18-0.54-0.28227-1.1168-0.28227-1.71s0.10227-1.17 0.28227-1.71v-2.3318h-3.0068c-0.60955 1.215-0.95727 2.5895-0.95727 4.0418 0 1.4523 0.34773 2.8268 0.95727 4.0418z"
                        fill="#fbbc05"
                      />
                      <path
                        id="path46"
                        d="m9 3.5795c1.3214 0 2.5077 0.45409 3.4405 1.3459l2.5814-2.5814c-1.5586-1.4523-3.5959-2.3441-6.0218-2.3441-3.5182 0-6.5618 2.0168-8.0427 4.9582l3.0068 2.3318c0.70773-2.1273 2.6918-3.7105 5.0359-3.7105z"
                        fill="#ea4335"
                      />
                      <path id="path48" d="m0 0h18v18h-18z" />
                    </g>
                  </SvgIcon>
                }
                onClick={() => {
                  signIn(experiments.includes('gmail') ? 'googleEx' : 'google');
                }}
                variant="outlined"
                color="primary"
              >
                Prisijungti su Google
              </Button>
            )}
            {session && (
              <Button
                className={classes.google}
                onClick={() => {
                  signOut();
                }}
                variant="outlined"
                color="primary"
              >
                Atsijungti
              </Button>
            )}
          </Toolbar>
        </Grid>

        <Grid item xs={12}>
          <Toolbar className={classes.toolbarSecondary}>
            <Link href="/" color="primary" className={classes.toolbarLink}>
              Pagrindinis
            </Link>
            {session && (
              <Link
                href="/saskaitos"
                color="primary"
                className={classes.toolbarLink}
              >
                Sąskaitos
              </Link>
            )}
            {session && (
              <Link
                href="/islaidos"
                color="primary"
                className={classes.toolbarLink}
              >
                Išlaidos
              </Link>
            )}
            {session && (
              <Link
                href="/nustatymai"
                color="primary"
                className={classes.toolbarLink}
              >
                Nustatymai
              </Link>
            )}
            <Link
              href="/straipsniai/pakeitimai"
              color="primary"
              className={classes.toolbarLink}
            >
              Pakeitimai
            </Link>
            <Link href="/apie" color="primary" className={classes.toolbarLink}>
              Apie
            </Link>
          </Toolbar>
        </Grid>

        <Grid item xs={12}>
          {children}
        </Grid>

        <Grid item xs={12}>
          <Copyright />
        </Grid>
      </Grid>

      <Snackbar
        open={!!state.messageText}
        autoHideDuration={6000}
        onClose={handleMessageClose}
      >
        <Alert
          onClose={handleMessageClose}
          severity={state.messageSeverity}
          closeText="Uždaryti"
        >
          {state.messageText}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Layout;
