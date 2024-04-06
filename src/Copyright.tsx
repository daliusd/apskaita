import { Anchor, Box, Text } from '@mantine/core';

import Link from './Link';

export default function Copyright() {
  return (
    <Box mt={6}>
      <Text variant="body2" c="dimmed" ta="center">
        <Link c="inherit" href="/privatumas">
          Privatumo politika
        </Link>
        {' | '}
        <Link c="inherit" href="/naudojimas">
          Naudojimo sąlygos
        </Link>
        {' | '}
        <Link c="inherit" href="/kontaktai">
          Kontaktai
        </Link>
        {' | © '}
        <Anchor c="inherit" href="https://www.ffff.lt/" underline="hover">
          Dalius Dobravolskas
        </Anchor>{' '}
        {new Date().getFullYear()}
      </Text>
    </Box>
  );
}
