import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { signIn, signOut, useSession } from 'next-auth/client';

import Copyright from './Copyright';
import Link from './Link';

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

  if (loading) return <LinearProgress />;

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
    </Container>
  );
};

export default Layout;
