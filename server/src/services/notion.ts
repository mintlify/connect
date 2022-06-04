import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { urlify } from '../helpers/routes/links';
import { NotionToMarkdown } from 'notion-to-md';
import { ContentData } from './webscraper';

dotenv.config();

export const isNotionUrl = (url: URL): boolean => url.host === 'www.notion.so' || url.host === 'notion.so';

export const getPageId = (url: URL): string => {
  const { pathname } = url;
  const index = pathname.lastIndexOf('-') + 1;
  const pageId = pathname.slice(index);
  return pageId;
};


export const getNotionPageData = async (url: string, notionAccessToken: string): Promise<ContentData> => {
  const parsedUrl = new URL(urlify(url));
  const notion = new Client({ auth: notionAccessToken });
  const page_id = getPageId(parsedUrl);
  const page: any = await notion.pages.retrieve({ page_id });
  const title: string = page.properties.title.title[0].plain_text + (page.icon.type === 'emoji' ? page.icon.emoji : '');
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const mdBlocks = await n2m.pageToMarkdown(page_id);
  const mdString = n2m.toMarkdownString(mdBlocks);

  return {
    // the favicon field should be added later
    method: 'notion-private',
    title,
    content: mdString,
  };
};
