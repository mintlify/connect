import Doc from '../../models/Doc';
import { OrgType } from '../../models/Org';
import { ConfluencePage } from '../../routes/integrations/confluence';
import { GoogleDoc } from '../../routes/integrations/google';
import { NotionPage } from '../../routes/integrations/notion';
import { clearIndexWithMethod, indexDocForSearch } from '../../services/algolia';
import { getGoogleDocsPrivateData } from '../../services/googleDocs';
import { getNotionPageDataWithId } from '../../services/notion';
import { track } from '../../services/segment';

export const importDocsFromNotion = async (pages: NotionPage[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'notion-private';
  await clearIndexWithMethod(orgId.toString(), method);
  const addDocPromises = pages.map((page) => new Promise<void>(async (resolve) => {
    try {
      if (org.integrations?.notion?.access_token == null) {
        throw 'No Notion credentials'
      };
      let content;
      try {
        const contentResponse = await getNotionPageDataWithId(page.id, org.integrations.notion.access_token);
        content = contentResponse.content;
      } catch {
        // TBD: find ways to detect contect async or mark docs that still need scraping
        content = ''
      }
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url: page.url,
        },
        {
          org: orgId,
          url: page.url,
          method,
          notion: {
            pageId: page.id,
          },
          content,
          title: `${page.icon?.emoji ? `${page.icon?.emoji} ` : ''}${page.title}`,
          favicon: page.icon?.file,
          createdBy: userId,
          isJustAdded: true,
          lastUpdatedAt: Date.parse(page.lastEditedTime)
        },
        {
          upsert: true,
          new: true,
        }
      );
      
      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method,
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
}

export const importDocsFromGoogleDocs = async (docs: GoogleDoc[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'googledocs-private';
  await clearIndexWithMethod(orgId.toString(), method);
  const addDocPromises = docs.map((googleDoc) => new Promise<void>(async (resolve) => {
    try {
      if (org.integrations?.google == null) {
        throw 'No Google credentials'
      };
      
      const { content } = await getGoogleDocsPrivateData(googleDoc.id, org.integrations.google);
      const doc = await Doc.findOneAndUpdate(
        {
          org: org._id,
          url: `https://docs.google.com/document/d/${googleDoc.id}`,
        },
        {
          org: orgId,
          url: `https://docs.google.com/document/d/${googleDoc.id}`,
          method,
          googledocs: {
            id: googleDoc.id,
          },
          content,
          title: googleDoc.name,
          createdBy: userId,
          isJustAdded: true,
          lastUpdatedAt: Date.parse(googleDoc.modifiedTime)
        },
        {
          upsert: true,
          new: true,
        }
      );

      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method,
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
};

export const importDocsFromConfluence = async (pages: ConfluencePage[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'confluence-private';
  await clearIndexWithMethod(orgId.toString(), method);
  const addDocPromises = pages.map((page) => new Promise<void>(async (resolve) => {
    try {
      const firstSpace = org?.integrations?.confluence?.accessibleResources[0];
      if (org?.integrations?.confluence?.accessibleResources[0] == null) {
        throw 'No organization found with accessible resources';
      }
      const url = `${firstSpace?.url}/wiki${page._links.webui}`;
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url,
        },
        {
          org: orgId,
          url,
          method,
          confluence: {
            id: page.id,
          },
          content: page.content,
          title: page.title,
          createdBy: userId,
          isJustAdded: false,
          lastUpdatedAt: Date.parse(page.history.lastUpdated.when)
        },
        {
          upsert: true,
          new: true,
        }
      );

      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method,
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
};

export type GitHubMarkdown = {
  path: string,
  url: string,
  content: string,
  lastUpdatedAt: string
}

export const importDocsFromGitHub = async (markdowns: GitHubMarkdown[], org: OrgType, userId: string) => {
  const orgId = org._id;
  const method = 'github';
  await clearIndexWithMethod(orgId.toString(), method);
  const addDocPromises = markdowns.map((markdown) => new Promise<void>(async (resolve) => {
    try {
      const orgId = org._id;
      const url = markdown.url;
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url,
        },
        {
          org: orgId,
          url,
          method,
          content: markdown.content,
          title: markdown.path,
          createdBy: userId,
          isJustAdded: false,
          lastUpdatedAt: Date.parse(markdown.lastUpdatedAt)
        },
        {
          upsert: true,
          new: true,
        }
      );

      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method,
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
};