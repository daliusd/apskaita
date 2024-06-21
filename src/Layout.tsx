import React, { useEffect } from 'react';
import { Button, Container, Divider, Grid, Group, Text } from '@mantine/core';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLocalStorage } from 'react-use';

import Copyright from './Copyright';
import Link from './Link';
import { setUser } from '../utils/error-handler';
import MenuToolbar from './MenuToolbar';
import { GoogleIcon } from '../components/GoogleIcon';
import { usePlan } from './usePlan';
import { getDateString } from '../utils/date';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [experiments] = useLocalStorage('experiments', '');

  const { endDate, isFree } = usePlan();

  useEffect(() => {
    if (
      (session as unknown as { error: string })?.error ===
      'RefreshAccessTokenError'
    ) {
      signIn(experiments.includes('exp') ? 'googleEx' : 'google');
    }
  }, [session, experiments]);

  useEffect(() => {
    if (session) {
      setUser(session.user.email);
    } else {
      setUser(null);
    }
  }, [session]);

  return (
    <Container size="lg">
      <Grid gutter={{ base: 12 }}>
        <Grid.Col span={12}>
          <Group justify="space-between">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/haikulogo.svg"
                alt="Haiku.lt"
                width="192"
                height="64"
              />
            </Link>
            {status !== 'loading' && !session && (
              <Button
                leftSection={<GoogleIcon />}
                onClick={() => {
                  signIn(experiments.includes('gmail') ? 'googleEx' : 'google');
                }}
                variant="subtle"
              >
                Prisijungti su Google
              </Button>
            )}
            {session && (
              <Group>
                <Group gap="6px">
                  <Text fw="700">Planas:</Text>
                  <Link href="/pro">
                    <Text>
                      {isFree
                        ? 'Nemokamas'
                        : `Pro (iki ${getDateString(endDate)})`}
                    </Text>
                  </Link>
                </Group>
                <Button
                  onClick={() => {
                    signOut();
                  }}
                  variant="subtle"
                >
                  Atsijungti
                </Button>
              </Group>
            )}
          </Group>
          <Divider />
        </Grid.Col>

        <Grid.Col span={12}>
          <MenuToolbar />
        </Grid.Col>

        <Grid.Col span={12}>{children}</Grid.Col>

        <Grid.Col span={12}>
          <Copyright />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Layout;
