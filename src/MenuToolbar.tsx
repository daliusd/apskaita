import * as React from 'react';
import { Box, Button, Drawer, ActionIcon, NavLink, Group } from '@mantine/core';
import { IconMenu } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Link from './Link';

const navItems = [
  {
    name: 'Pagrindinis',
    url: '/',
    session: undefined,
  },
  {
    name: 'Sąskaitos',
    url: '/saskaitos',
    session: true,
  },
  {
    name: 'Išlaidos',
    url: '/islaidos',
    session: true,
  },
  {
    name: 'Nustatymai',
    url: '/nustatymai',
    session: true,
  },
  {
    name: 'Planai',
    url: '/planai',
    session: undefined,
  },
  {
    name: 'Kontaktai',
    url: '/kontaktai',
    session: false,
  },
  {
    name: 'Pagalba',
    url: '/pagalba',
    session: undefined,
  },
];

export default function MenuToolbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  return (
    <>
      <Group>
        <ActionIcon
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          hiddenFrom="sm"
        >
          <IconMenu />
        </ActionIcon>
        <Button onClick={handleDrawerToggle} hiddenFrom="sm" variant="subtle">
          {
            navItems.filter((e) => router.pathname.startsWith(e.url)).at(-1)
              ?.name
          }
        </Button>

        <Box visibleFrom="sm">
          {navItems
            .filter(
              (item) =>
                item.session === undefined || item.session === !!session,
            )
            .map((item) => (
              <Link key={item.url} href={item.url} pr={36}>
                {item.name}
              </Link>
            ))}
        </Box>
      </Group>
      <Box component="nav" hiddenFrom="sm">
        <Drawer opened={mobileOpen} onClose={handleDrawerToggle}>
          {navItems
            .filter(
              (item) =>
                item.session === undefined || item.session === !!session,
            )
            .map((item) => (
              <NavLink
                key={item.url}
                label={item.name}
                onClick={async () => {
                  await router.push(item.url);
                  handleDrawerToggle();
                }}
              />
            ))}
        </Drawer>
      </Box>
    </>
  );
}
