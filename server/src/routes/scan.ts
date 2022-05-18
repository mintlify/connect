import express from 'express';
import * as Diff from 'diff';
import Doc from '../models/Doc';
import Event, { EventType } from '../models/Event';
import { getDataFromWebpage } from '../services/webscraper';
import { triggerAutomationsForEvents } from '../automations';
import { updateDocContentForSearch } from '../services/algolia';

const scanRouter = express.Router();

type DiffAndContent = {
  diff: Diff.Change[],
  newContent: string,
}

type DiffAlert = {
  diff: Diff.Change[],
  newContent: string,
  doc: any
}

const getDiffAndContent = async (url: string, previousContent: string, orgId: string): Promise<DiffAndContent> => {
  const { content } = await getDataFromWebpage(url, orgId);
  return {
    diff: Diff.diffWords(previousContent, content),
    newContent: content
  }
}

scanRouter.post('/', async (req, res) => {
  const { org } = req.body;

  try {
    const docsFromOrg = await Doc.find({ org });
    const getDifferencePromises = docsFromOrg.map((doc) => {
      return getDiffAndContent(doc.url, doc.content ?? '', org);
    });

    const diffsAndContent = await Promise.all(getDifferencePromises);

    const diffAlerts: DiffAlert[] = [];
    diffsAndContent.forEach(({ diff, newContent }, i) => {
      const hasChanges = diff.some((diff) => diff.added || diff.removed);
      if (hasChanges) {
        diffAlerts.push({
          doc: docsFromOrg[i],
          newContent,
          diff
        });
      }
    });

    const docUpdateQueries = diffAlerts.map(({ doc, newContent }) => {
      return {
        updateOne: {
          filter: { _id: doc._id },
          update: { content: newContent, lastUpdatedAt: new Date() }
        }
      }
    })

    const bulkWriteDocsPromise = Doc.bulkWrite(docUpdateQueries, {
      ordered: false
    });

    const newEvents: EventType[] = diffAlerts.map((alert) => {
      return {
        org,
        doc: alert.doc._id,
        type: 'change',
        change: alert.diff,
      }
    });
    const insertManyEventsPromise = Event.insertMany(newEvents);
    const updateSearchDocRecordsPromises: Promise<void>[] = diffAlerts.map(({ doc, newContent}) => {
      return updateDocContentForSearch(doc, newContent);
    });
    const [_, insertManyEventsRes] = await Promise.all([bulkWriteDocsPromise, insertManyEventsPromise, updateSearchDocRecordsPromises]);
    await triggerAutomationsForEvents(org, insertManyEventsRes);
   
    res.send({diffAlerts});
  }

  catch (error) {
    res.status(500).send({error})
  }
});

export default scanRouter;