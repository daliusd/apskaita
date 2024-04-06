import { useEffect } from 'react';
import 'dayjs/locale/lt';
import { DatesProvider } from '@mantine/dates';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import { SWRConfig } from 'swr';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';

import Layout from '../src/Layout';
import { init } from '../utils/error-handler';

const mantineTheme = createTheme({});

init();

interface MyAppProps extends AppProps<SessionProviderProps> {}

export default function MyApp(props: MyAppProps) {
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher: (...url: string[]) =>
          fetch(url.join('')).then((res) => res.json()),
        dedupingInterval: 0,
      }}
    >
      <Head>
        <title>Haiku.lt</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MantineProvider theme={mantineTheme}>
        <Notifications />
        <DatesProvider
          settings={{
            locale: 'lt',
            firstDayOfWeek: 1,
            weekendDays: [0, 6],
            timezone: 'UTC',
          }}
        >
          <SessionProvider session={pageProps.session}>
            <RecoilRoot>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </RecoilRoot>
          </SessionProvider>
        </DatesProvider>
      </MantineProvider>
    </SWRConfig>
  );
}
