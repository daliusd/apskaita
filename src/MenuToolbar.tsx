import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Link from './Link';

const drawerWidth = 240;
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
    name: 'Kaina',
    url: '/kaina',
    session: false,
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
      <Toolbar disableGutters={true}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Button onClick={handleDrawerToggle} sx={{ display: { sm: 'none' } }}>
          {
            navItems.filter((e) => router.pathname.startsWith(e.url)).at(-1)
              ?.name
          }
        </Button>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          {navItems
            .filter(
              (item) =>
                item.session === undefined || item.session === !!session,
            )
            .map((item) => (
              <Link key={item.url} href={item.url} sx={{ paddingRight: 6 }}>
                {item.name}
              </Link>
            ))}
        </Box>
      </Toolbar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          <Box onClick={handleDrawerToggle} sx={{ textAlign: 'left' }}>
            <List>
              {navItems
                .filter(
                  (item) =>
                    item.session === undefined || item.session === !!session,
                )
                .map((item) => (
                  <ListItem key={item.url} disablePadding>
                    <ListItemButton
                      sx={{ textAlign: 'left' }}
                      onClick={() => router.push(item.url)}
                    >
                      <ListItemText primary={item.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
