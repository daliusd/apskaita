import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const articlesDirectory = join(process.cwd(), 'articles');

export function getArticles() {
  return fs.readdirSync(articlesDirectory).map((a) => a.replace(/\.md$/, ''));
}

export function getArticleBySlug(slug: string) {
  const fullPath = join(articlesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return { slug, meta: data, content };
}
