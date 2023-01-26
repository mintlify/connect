import express from 'express';
import Org, { OrgType } from '../models/Org';
import User from '../models/User';
import Code from '../models/Code';
import { track } from '../services/segment';
import { client } from '../services/stytch';
import { checkIfUserHasVSCodeInstalled, removeUnneededDataFromOrg, userMiddleware } from './user';


const orgRouter = express.Router();

orgRouter.get('/subdomain/:subdomain/auth', async (req, res) => {
  const { subdomain } = req.params;

  const org = await Org.findOne({ subdomain });
  if (org == null) {
    res.send({ org });
    return;
  }

  return res.send({
    org: {
      id: org._id,
      name: org.name,
      logo: org.logo,
      favicon: org.favicon,
    },
  });
});

orgRouter.get('/subdomain/:subdomain/details', userMiddleware, async (req, res) => {
  const { subdomain } = req.params;
  const { org } = res.locals.user;

  try {
    if (org.subdomain !== subdomain) {
      throw 'User does not have access to subdomain'
    }
    const formattedOrg = removeUnneededDataFromOrg(org);
    return res.json({ org: formattedOrg });
  } catch (error) {
    return res.status(400).send({ error });
  }
});

orgRouter.put('/:orgId/notifications', userMiddleware, async (req: express.Request, res: express.Response) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org._id.toString();
  const { monthlyDigest, newsletter } = req.body;

  if (userOrgId !== orgId) {
    return res.status(403).send({ error: 'User does not have permission' });
  }

  if (monthlyDigest === null || newsletter === null)
    return res.status(400).json({ error: 'Both the monthlyDigest and newsletter values must be provided' });

  try {
    await Org.findByIdAndUpdate(orgId, { notifications: { monthlyDigest, newsletter } });
    return res.status(200).end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

// Given an orgId from the request query, return all the user objects within that organization
orgRouter.get('/users', userMiddleware, async (_: any, res: express.Response) => {
  const { org } = res.locals.user;
  const users = await User.find({ userId: org.users });
  const invitedEmails: string[] = org.invitedEmails || [];
  const invitedUsers = invitedEmails.map((email) => {
    return {
      email,
      pending: true,
    };
  }) as any;
  return res.status(200).json({ users: users.concat(invitedUsers) });
});

orgRouter.put('/:orgId/name', userMiddleware, async (req, res) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org._id.toString();
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({ error: 'Name not provided' });
  }

  if (userOrgId !== orgId) {
    return res.status(403).send({ error: 'User does not have permission' });
  }

  try {
    await Org.findByIdAndUpdate(orgId, { name });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

orgRouter.get('/:orgId/integrations', userMiddleware, async (_, res) => {
  const { org }: { org: OrgType } = res.locals.user;

  try {
    if (org?.integrations == null) {
      return res.send({ integrations: { github: false, notion: false, vscode: false, slack: false } });
    }

    const isVSCodeInstalled = await checkIfUserHasVSCodeInstalled(res.locals.user.userId);
    const integrations = {
      github: org.integrations.github?.installations != null,
      notion: org.integrations.notion?.access_token != null,
      slack: org.integrations.slack?.accessToken != null,
      google: org.integrations.google?.access_token != null,
      confluence: org.integrations.confluence?.access_token != null,
      vscode: isVSCodeInstalled, // dependent on the user
    };

    return res.send({ integrations });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

const isDomainAvailable = async (subdomain: string): Promise<boolean> => {
  const overrideSubdomains: Record<string, boolean> = {
    api: true,
    connect: true,
    www: true,
    docs: true,
  };
  if (overrideSubdomains[subdomain]) {
    return false;
  }

  const orgExists = await Org.exists({ subdomain });
  return orgExists == null;
};

orgRouter.get('/availability/:subdomain', async (req, res) => {
  const { subdomain } = req.params;
  const available = await isDomainAvailable(subdomain);
  return res.send({ available });
});

orgRouter.post('/', async (req, res) => {
  const { sessionToken, firstName, lastName, orgName, subdomain } = req.body;

  if (!sessionToken || !firstName || !lastName || !orgName || !subdomain) {
    return res.status(400).send({ error: 'Missing information from form' });
  }

  try {
    const authUser = await client.sessions.authenticate({ session_token: sessionToken, session_duration_minutes: 5 });

    const { emails, user_id: userId } = authUser.user;
    const newSessionToken = authUser.session_token;

    const isOrgAvailable = await isDomainAvailable(subdomain);
    if (!isOrgAvailable) {
      return res.send({ error: 'Organization subdomain is already taken' });
    }

    const user = await User.findOneAndUpdate(
      {
        userId,
      },
      {
        userId,
        email: emails[0].email,
        firstName,
        lastName,
      },
      { upsert: true, new: true }
    );

    const org = await Org.create({
      name: orgName,
      subdomain,
      users: [user.userId],
    });

    const redirectUrl: string = `https://${org.subdomain}.mintlify.com/api/auth/landing?sessionToken=${newSessionToken}`;

    track(user.userId, 'Create Organization', {
      name: orgName,
      subdomain,
      from: 'webflow',
    });

    return res.send({ redirectUrl });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

orgRouter.put('/access', userMiddleware, async (req, res) => {
  const { mode } = req.body;
  if (!mode) {
    return res.status(400).send({ error: 'No mode selected' });
  }

  if (mode !== 'private' && mode !== 'public') {
    return res.status(400).send({ error: 'Invalid mode' });
  }

  await Org.findByIdAndUpdate(res.locals.user.org._id, {
    'access.mode': mode,
  });

  return res.end();
});

orgRouter.get('/gitOrg/:gitOrg/details', async (req, res) => {
  const { gitOrg } = req.params;
  const { repo } = req.query;
  try {
    // FindOne might cause an issue with separate installations on the same org
    const orgPromise = Org.findOne({'integrations.github.installations': {
      $elemMatch: {
          'account.login': gitOrg
      }
    }});
    const codesPromise = Code.find({ gitOrg, repo });
    const [org, codes] = await Promise.all([orgPromise, codesPromise])
    const formattedOrg = removeUnneededDataFromOrg(org);
    return res.json({ org: formattedOrg, codes });
  } catch (error) {
    return res.status(400).send({ error });
  }
});

orgRouter.delete('/trial/model', userMiddleware, async (_, res) => {
  const { org } = res.locals.user;

  await Org.findByIdAndUpdate(org._id, {'plan.isHidingModel': true});
  res.end();
});

orgRouter.delete('/member/:email', userMiddleware, async (req, res) => {
  const { email } = req.params;
  const { org } = res.locals.user;

  try {
    if (org.invitedEmails.includes(email)) {
      await Org.findByIdAndUpdate(org._id, { $pull: { invitedEmails: email } });
      return res.end();
    }

    // else remove user
    const user = await User.findOne({ email });
    if (user == null) {
      return res.status(400).send({ error: 'User does not belong in organization' })
    }
    
    await Org.findByIdAndUpdate(org._id, { $pull: { users: user.userId } });
    return res.end();

  } catch {
    return res.status(500).send({ error: 'Error while deleting member' })
  }
})

export default orgRouter;
