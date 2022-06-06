import axios from 'axios';
import express from 'express';
import { Types } from 'mongoose';
import { userMiddleware } from './user';
import { createEvent } from './events';
import Doc from '../models/Doc';
import Event from '../models/Event';
import { extractDataFromHTML, getDataFromWebpage } from '../services/webscraper';
import { deleteDocForSearch, indexDocForSearch } from '../services/algolia';
import { track } from '../services/segment';

const docsRouter = express.Router();

// userId is the _id of the user not `userId`
export const createDocFromUrl = async (url: string, orgId: string, userId: Types.ObjectId) => {
  const { content, method, title, favicon } = await getDataFromWebpage(url, orgId);
  const doc = await Doc.findOneAndUpdate(
    {
      org: orgId,
      url,
    },
    {
      org: orgId,
      url,
      method,
      content,
      title,
      favicon,
      createdBy: userId,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return { content, doc, method };
};

docsRouter.get('/', userMiddleware, async (_, res) => {
  const org = res.locals.user.org;
  try {
    const docs = await Doc.aggregate([
      {
        $match: { org },
      },
      {
        $sort: { lastUpdatedAt: -1 },
      },
      {
        $lookup: {
          from: 'code',
          foreignField: 'doc',
          localField: '_id',
          as: 'code',
        },
      },
      {
        $lookup: {
          from: 'automations',
          foreignField: 'source.doc',
          localField: '_id',
          as: 'automations',
        },
      },
    ]);
    return res.status(200).send({ docs });
  } catch (error) {
    return res.status(500).send({ error, docs: [] });
  }
});

docsRouter.get('/preview', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.end();
  }

  try {
    const response = await axios.get(url);
    const { title, favicon } = await extractDataFromHTML(url, response.data);
    return res.send({title, favicon});
  } catch {
    return res.status(400).send({error: 'Unable to fetch content from URL'});
  }
})

docsRouter.post('/', userMiddleware, async (req, res) => {
  const { url } = req.body;
  const org = res.locals.user.org;
  try {
    const { content, doc, method } = await createDocFromUrl(url, org, res.locals.user._id);
    if (doc != null) {
      await createEvent(org, doc._id, 'add', {});
      indexDocForSearch(doc);
      track(res.locals.user.userId, 'Add documentation', {
        doc: doc._id.toString(),
        method,
        org: org.toString(),
      });
    } else console.log('Doc is null');
    res.send({ content });
  } catch (error) {
    res.status(500).send({ error });
  }
});

docsRouter.delete('/:docId', userMiddleware, async (req, res) => {
  const { docId } = req.params;
  const { org } = res.locals.user;

  try {
    const deleteDocPromise = Doc.findOneAndDelete({ _id: docId, org });
    const deleteEventsPromise = Event.deleteMany({ doc: docId });
    const deleteDocForSearchPromise = deleteDocForSearch(docId);

    await Promise.all([deleteDocPromise, deleteEventsPromise, deleteDocForSearchPromise]);
    res.end();
  } catch (error) {
    res.status(500).send({ error });
  }
});

docsRouter.post('/content', async (req, res) => {
  const { url, orgId } = req.body;

  try {
    const page = await getDataFromWebpage(url, orgId, 6000);
    res.send({ page });
  } catch (error) {
    res.status(500).send({ error });
  }
});

export default docsRouter;
