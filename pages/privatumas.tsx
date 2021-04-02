import React from 'react';
import ArticleView from '../components/ArticleView';
import { getArticleBySlug } from '../db/articles';

export default function Privacy({ article }) {
  return <ArticleView article={article} showDate={false} />;
}

export async function getStaticProps() {
  const article = await getArticleBySlug('privatumas');
  return { props: { article } };
}
