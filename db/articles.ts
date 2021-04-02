import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import remark from 'remark';
import html from 'remark-html';

export interface IArticleMeta {
  title: string;
  date: string;
}

export interface IArticle {
  slug: string;
  meta: IArticleMeta;
  content: string;
}

const articlesDirectory = join(process.cwd(), 'articles');

export function getArticles() {
  return fs.readdirSync(articlesDirectory).map((a) => a.replace(/\.md$/, ''));
}

export async function getArticleBySlug(slug: string): Promise<IArticle> {
  const fullPath = join(articlesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const htmlContent = (
    await remark()
      .use(html)
      .process(content || '')
  ).toString();

  return { slug, meta: data as IArticleMeta, content: htmlContent };
}
