import Head from 'next/head';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { IArticle } from '../db/articles';
import styles from './ArticleView.module.css';

interface ArticleViewProps {
  article: IArticle;
  showTitle?: boolean;
  showDate?: boolean;
  showStructuredData?: boolean;
}

export default function ArticleView({
  article,
  showTitle = true,
  showDate = true,
  showStructuredData = true,
}: ArticleViewProps) {
  if (!article?.slug) {
    return (
      <Typography variant="body1" component="div" align="center">
        Straipsnis nerastas :-(
      </Typography>
    );
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
        {showStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredArticle),
            }}
          ></script>
        )}
      </Head>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          {showTitle && (
            <Typography variant="h4">{article.meta.title}</Typography>
          )}

          {showDate && (
            <Typography variant="body1" color="textSecondary">
              {article.meta.modified}
            </Typography>
          )}

          <Typography variant="body1" component="div">
            <div
              className={styles.videoWrapper}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Typography>
        </Grid>
      </Grid>
    </>
  );
}
