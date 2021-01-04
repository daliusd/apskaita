import React from 'react';
import { SWRConfig } from 'swr';
import Head from 'next/head';
import { Provider } from 'next-auth/client';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import type { AppProps /*, AppContext */ } from 'next/app';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import ltLocale from 'date-fns/locale/lt';
import theme from '../src/theme';
import Layout from '../src/Layout';

export default function MyApp(props: AppProps) {
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
      }}
    >
      <Head>
        <title>Haiku.lt</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ltLocale}>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Provider session={pageProps.session}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Provider>
        </ThemeProvider>
      </MuiPickersUtilsProvider>
    </SWRConfig>
  );
}
