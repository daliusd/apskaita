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

  return (
    <>
      <Head>
        <title>{article.meta.title} | Haiku.lt</title>
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
