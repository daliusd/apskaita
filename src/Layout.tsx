import React, { useEffect } from 'react';
import { Button, Container, Divider, Grid, Group } from '@mantine/core';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useLocalStorage } from 'react-use';

import Copyright from './Copyright';
import Link from './Link';
import { setUser } from '../utils/error-handler';
import MenuToolbar from './MenuToolbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [experiments] = useLocalStorage('experiments', '');

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
                leftSection={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 46 46"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  </svg>
                }
                onClick={() => {
                  signIn(experiments.includes('gmail') ? 'googleEx' : 'google');
                }}
                variant="subtle"
              >
                Prisijungti su Google
              </Button>
            )}
            {session && (
              <Button
                onClick={() => {
                  signOut();
                }}
                variant="subtle"
              >
                Atsijungti
              </Button>
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
