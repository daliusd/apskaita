import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-recipes';
import ArticleView from '../../components/ArticleView';
import { getArticleBySlug } from '../../db/articles';

export default function Kodas({ article }) {
  const router = useRouter();

  const [code, setCode] = useLocalStorage('code', '');
  const value = router.query.id;

  useEffect(() => {
    if (value === undefined || router === undefined) {
      return;
    }

    if (code === value) {
      router.replace('/');
    } else {
      setCode(value);
      router.reload();
    }
  }, [value, router, code, setCode]);

  return (
    <ArticleView
      article={article}
      showTitle={false}
      showDate={false}
      showStructuredData={false}
    />
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  const article = await getArticleBySlug('pirmas');
  return { props: { article } };
}
