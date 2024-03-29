import { useEffect } from 'react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { lt } from 'date-fns/locale/lt';
import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import type { AppProps /*, AppContext */ } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import { SWRConfig } from 'swr';

import createEmotionCache from '../src/createEmotionCache';
import Layout from '../src/Layout';
import theme from '../src/theme';
import { init } from '../utils/error-handler';

init();

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps<SessionProviderProps> {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

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
      <CacheProvider value={emotionCache}>
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
      </CacheProvider>
    </SWRConfig>
  );
}
