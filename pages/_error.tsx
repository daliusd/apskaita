import NextErrorComponent from 'next/error';
import * as Sentry from '@sentry/node';

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
  if (!hasGetInitialPropsRun && err) {
    Sentry.captureException(err);
  }

  return <NextErrorComponent statusCode={statusCode} />;
};

MyError.getInitialProps = async ({ res, err, asPath }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  const hasGetInitialPropsRun = true;

  if (err) {
    Sentry.captureException(err);

    return { statusCode, err, hasGetInitialPropsRun };
  }

  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`),
  );
  return { statusCode, err, hasGetInitialPropsRun };
};

export default MyError;
