import ArticleView from '../components/ArticleView';
import { getArticleBySlug } from '../db/articles';

export default function Apie({ article }) {
  return <ArticleView article={article} showDate={false} />;
}

export async function getStaticProps() {
  const article = await getArticleBySlug('kontaktai');
  return { props: { article } };
}
