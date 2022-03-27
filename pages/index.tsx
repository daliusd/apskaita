import React from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import ArticleView from '../components/ArticleView';
import { getArticleBySlug } from '../db/articles';

const MainInfo = dynamic(() => import('../components/MainInfo'));

export default function Index({ article }) {
  const { data: session } = useSession();

  if (!session) {
    return (
      <ArticleView
        article={article}
        showTitle={false}
        showDate={false}
        showStructuredData={false}
      />
    );
  }

  return <MainInfo />;
}

export async function getStaticProps() {
  const article = await getArticleBySlug('pirmas');
  return { props: { article } };
}
