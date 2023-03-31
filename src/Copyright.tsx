import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';

import Link from './Link';

export default function Copyright() {
  return (
    <Box mt={6}>
      <Typography variant="body2" color="textSecondary" align="center">
        <Link color="inherit" href="/privatumas">
          Privatumo politika
        </Link>
        {' | '}
        <Link color="inherit" href="/naudojimas">
          Naudojimo sąlygos
        </Link>
        {' | '}
        <Link color="inherit" href="/kontaktai">
          Kontaktai
        </Link>
        {' | © '}
        <MuiLink color="inherit" href="https://www.ffff.lt/" underline="hover">
          Dalius Dobravolskas
        </MuiLink>{' '}
        {new Date().getFullYear()}
      </Typography>
    </Box>
  );
}
