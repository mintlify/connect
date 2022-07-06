import express from 'express';
import Code from '../models/Code';
import Doc from '../models/Doc';
import { track } from '../services/segment';
import { userMiddleware } from './user';
import { getDataFromUrl } from './docs';
import { indexDocsForSearch } from '../services/algolia';

const linksRouter = express.Router();

linksRouter.get('/', userMiddleware, async (req, res) => {
  const { org } = res.locals.user;
  let matchQuery: any = { org: org._id };

  if (req.query?.repo) {
    matchQuery.repo = req.query.repo;
  }

  if (req.query?.gitOrg) {
    matchQuery.gitOrg = req.query.gitOrg;
  }

  if (req.query?.file) {
    matchQuery.file = req.query.file;
  }
  
  try {
    const codes = await Code.aggregate([
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'docs',
          foreignField: '_id',
          localField: 'doc',
          as: 'doc',
        },
      },
      {
        $set: {
          doc: { $first: "$doc" },
        },
      },
      {
        $match: { doc: { $exists: true } }
      },
    ]);
    res.send({codes});
  }
  catch (error: any) {
    res.status(400).send({ error });
  }
});

linksRouter.put('/', userMiddleware, async (req, res) => {
  try {
    const { docId, code, url } = req.body;
    const { org, userId } = res.locals.user;
    let doc = null;
    if ( docId === 'create') {
      const { title, favicon, urlWithProtocol } = await getDataFromUrl(url);
      doc = await Doc.findOneAndUpdate({
        org: org._id,
        url: urlWithProtocol,
      }, {
        org: org._id,
        url: urlWithProtocol,
        method: 'web',
        favicon,
        title,
        isJustAdded: true,
        createdBy: userId
      }, { upsert: true, new: true });

      if (doc == null) {
        return res.status(400).send({error: "Could not create document"});
      }

      indexDocsForSearch([doc]);
    } else {
      doc = await Doc.findById(docId);

      if (doc == null) {
          return res.status(400).send({error: 'Invalid docId'});
      }
    }

    await Code.findOneAndUpdate(
      {
        org: org._id,
        doc: doc._id,
        url: code.url
      },
      code,
      {
        upsert: true
      }
    );

    track(res.locals.user.userId, 'Add code link', {
      doc: docId.toString(),
    })

    return res.send({doc});
  }
  catch (error) {
    return res.status(400).send({error})
  }
});

linksRouter.delete('/:codeId', userMiddleware, async (req, res) => {
  const { codeId } = req.params;
  const { org } = res.locals.user;
  
  try {
    await Code.findOneAndDelete({ _id: codeId, org: org._id });
    res.end();
  } catch (error) {
    res.status(500).send({error})
  }
})

export default linksRouter;