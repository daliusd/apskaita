import ErrorPage from 'next/error';
import Head from 'next/head';
import remark from 'remark';
import html from 'remark-html';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { getArticles, getArticleBySlug } from '../../db/articles';

export default function Post({ article }) {
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

          <Typography variant="body2" color="textSecondary">
            {article.meta.date}
          </Typography>

          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </Grid>
      </Grid>
    </>
  );
}

export async function getStaticProps({ params }) {
  const article = getArticleBySlug(params.slug);
  const content = (
    await remark()
      .use(html)
      .process(article.content || '')
  ).toString();

  return {
    props: {
      article: {
        ...article,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const articles = getArticles();

  return {
    paths: articles.map((article) => {
      return {
        params: {
          slug: article,
        },
      };
    }),
    fallback: false,
  };
}
