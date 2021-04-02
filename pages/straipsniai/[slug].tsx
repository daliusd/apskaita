import ArticleView from '../../components/ArticleView';
import { getArticles, getArticleBySlug } from '../../db/articles';

export default function Post({ article }) {
  return <ArticleView article={article} />;
}

export async function getStaticProps({ params }) {
  const article = await getArticleBySlug(params.slug);
  return { props: { article } };
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
