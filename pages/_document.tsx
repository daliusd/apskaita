import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ColorSchemeScript } from '@mantine/core';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="lt">
        <Head>
          <link rel="shortcut icon" href="/favicon.png" />
          <ColorSchemeScript defaultColorScheme="auto" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
