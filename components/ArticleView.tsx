import Head from 'next/head';
import ErrorPage from 'next/error';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { IArticle } from '../db/articles';

interface ArticleViewProps {
  article: IArticle;
  showDate?: boolean;
}

export default function ArticleView({
  article,
  showDate = true,
}: ArticleViewProps) {
  if (!article?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  const structuredArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.meta.title,
    datePublished: article.meta.date + 'T08:00:00+00:00',
    dateModified: article.meta.modified + 'T08:00:00+00:00',
  };

  return (
    <>
      <Head>
        <title>{article.meta.title} | Haiku.lt</title>
        <meta name="description" content={article.description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredArticle),
          }}
        ></script>
      </Head>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">{article.meta.title}</Typography>

          {showDate && (
            <Typography variant="body2" color="textSecondary">
              {article.meta.date}
            </Typography>
          )}

          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </Grid>
      </Grid>
    </>
  );
}
