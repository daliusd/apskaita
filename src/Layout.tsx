import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { signIn, signOut, useSession } from 'next-auth/client';

import Copyright from './Copyright';
import Link from './Link';
import { Context, IContext } from '../src/Store';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbarTitle: {
    flex: 1,
  },
  toolbarSecondary: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  toolbarLink: {
    padding: theme.spacing(1),
  },
}));

const Layout: React.FC = ({ children }) => {
  const classes = useStyles();
  const [session, loading] = useSession();
  const { state, dispatch } = useContext<IContext>(Context);

  if (loading) return <LinearProgress />;

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
                Haiku.lt
              </Link>
            </Typography>
            {!session && (
              <Button
                onClick={() => {
                  signIn('google');
                }}
                color="primary"
              >
                Prisijungti
              </Button>
            )}
            {session && (
              <Button
                onClick={() => {
                  signOut();
                }}
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
                href="/nustatymai"
                color="primary"
                className={classes.toolbarLink}
              >
                Nustatymai
              </Link>
            )}
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
