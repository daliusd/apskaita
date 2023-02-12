import React from 'react';
import { SWRConfig } from 'swr';
import Head from 'next/head';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { AppProps /*, AppContext */ } from 'next/app';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from '../src/theme';
import Layout from '../src/Layout';
import { init } from '../utils/error-handler';
import { RecoilRoot } from 'recoil';
import { lt } from 'date-fns/locale';

init();

export default function MyApp(props: AppProps<SessionProviderProps>) {
  const { Component, pageProps } = props;

  React.useEffect(() => {
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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={lt}>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <SessionProvider session={pageProps.session}>
            <RecoilRoot>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </RecoilRoot>
          </SessionProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </SWRConfig>
  );
}
