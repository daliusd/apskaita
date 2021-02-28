import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';

import Link from './Link';

export default function Copyright() {
  return (
    <Box mt={6}>
      <Typography variant="body2" color="textSecondary" align="center">
        <Link color="inherit" href="/privatumas">
          Privatumo politika
        </Link>{' '}
        |{' '}
        <Link color="inherit" href="/naudojimas">
          Naudojimo sąlygos
        </Link>
        {' | © '}
        <MuiLink color="inherit" href="https://www.ffff.lt/">
          Dalius Dobravolskas
        </MuiLink>{' '}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
}
