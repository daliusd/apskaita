import Head from 'next/head';
import { Grid, Title, Text } from '@mantine/core';
import 'highlight.js/styles/github-dark.css';

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
    return <Text ta="center">Straipsnis nerastas :-(</Text>;
  }

  const structuredArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.meta.title,
    datePublished: article.meta.date + 'T08:00:00+00:00',
    dateModified: article.meta.modified + 'T08:00:00+00:00',
  };

  const title = `${article.meta.title} | Haiku.lt`;
  return (
    <>
      <Head>
        <title>{title}</title>
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

      <Grid gutter={{ base: 12 }} maw="40em">
        <Grid.Col span={12}>
          {showTitle && <Title order={2}>{article.meta.title}</Title>}

          {showDate && <Text c="dimmed">{article.meta.modified}</Text>}

          <Text component="div">
            <div
              className={styles.videoWrapper}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Text>
        </Grid.Col>
      </Grid>
    </>
  );
}
