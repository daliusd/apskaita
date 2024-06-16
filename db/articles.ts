import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import strip from 'strip-markdown';
import remarkStringify from 'remark-stringify';

export interface IArticleMeta {
  title: string;
  date: string;
  modified: string;
}

export interface IArticle {
  slug: string;
  meta: IArticleMeta;
  content: string;
  description: string;
}

const articlesDirectory = join(process.cwd(), 'articles');

export function getArticles() {
  return fs.readdirSync(articlesDirectory).map((a) => a.replace(/\.md$/, ''));
}

export async function getArticleBySlug(slug: string): Promise<IArticle> {
  const fullPath = join(articlesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const description = (
    await unified()
      .use(remarkParse)
      .use(strip)
      .use(remarkStringify)
      .process(content.split('\n\n')[0])
  )
    .toString()
    .replaceAll('\n', ' ');

  const htmlContent = (
    await unified()
      .use(remarkParse)
      .use(remarkRehype, {
        allowDangerousHtml: true,
      })
      .use(rehypeRaw)
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(content || '')
  ).toString();

  return {
    slug,
    meta: data as IArticleMeta,
    content: htmlContent,
    description,
  };
}
