import express from 'express';
import Org from '../models/Org';
import User from '../models/User';

const userRouter = express.Router();

export const userMiddleware = async (req: express.Request, res: express.Response, next: () => void) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send({ error: 'userId not provided' });
  }

  const user = await User.findOne({ userId });

  if (user == null) {
    return res.status(400).send({ error: 'Invalid userId' });
  }

  res.locals.user = user;

  next();
  return;
}

userRouter.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({ error: 'userId not provided' });
  }

  const users = await User.aggregate([
    {
      $match: {
        userId
      }
    },
    {
      $lookup: {
        from: 'orgs',
        localField: 'org',
        foreignField: '_id',
        as: 'org'
      }
    },
    {
      $set: {
        org: { $first: "$org" },
      }
    },
    {
      // Convert integration keys to boolean
      $set: {
        'org.integrations.notion': { $gt: ['$org.integrations.notion', null] },
        'org.integrations.github': { $gt: ['$org.integrations.github', null] },
        'org.integrations.slack': { $gt: ['$org.integrations.slack', null] },
      }
    }
  ]);

  const user = users[0];

  return res.send({user})
});

userRouter.post('/', async (req, res) => {
  const { userId, email, firstName, lastName, orgName } = req.body;

  const org = await Org.create({
    name: orgName
  })

  const user = await User.create({ 
      userId,
      email,
      firstName,
      lastName,
      org: org._id
   });
  return res.send({user});
});

userRouter.put('/:userId/firstname', async (req, res) => {
  const { userId } = req.params;
  const { firstName } = req.body;

  if (!firstName) {
    return res.status(400).send({error: 'First name not provided'});
  }

  try {
    await User.findOneAndUpdate({ userId }, { firstName });
    return res.end();
  }
  catch (error) {
    return res.status(500).send({error});
  }
});

userRouter.put('/:userId/lastname', async (req, res) => {
  const { userId } = req.params;
  const { lastName } = req.body;

  if (!lastName) {
    return res.status(400).send({error: 'Last name not provided'});
  }

  try {
    await User.findOneAndUpdate({ userId }, { lastName });
    return res.end();
  }
  catch (error) {
    return res.status(500).send({error});
  }
})

export default userRouter;