import express from 'express';
import Org from '../models/Org';
import User from '../models/User';
import { track } from '../services/segment';
import { client } from '../services/stytch';
import { checkIfUserHasVSCodeInstalled, removeUnneededDataFromOrg, userMiddleware } from './user';
import { EventType } from '../models/Event';
import mongoose from 'mongoose';
import { slackAutomationForEvent } from '../automations/slack';
import Doc from '../models/Doc';

// import { sendEmail } from '../services/mandrill';

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
  const { userId } = res.locals.user;

  try {
    const org = await Org.findOne({ subdomain, users: userId });
    const formattedOrg = removeUnneededDataFromOrg(org);
    return res.json({ org: formattedOrg });
  } catch (error) {
    return res.status(400).send({ error });
  }
});

orgRouter.put('/:orgId/notifications', userMiddleware, async (req: express.Request, res: express.Response) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();
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
  const orgId = res.locals.user.org;

  if (!orgId) return res.status(400).json({ error: 'orgId not provided' });

  const org = await Org.findById(orgId);
  if (org == null) return res.status(400).json({ error: 'Invalid organization ID' });

  const users = await User.find({ userId: org.users });
  const invitedEmails = org.invitedEmails || [];
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
  const userOrgId = res.locals.user.org.toString();
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

orgRouter.get('/:orgId/integrations', userMiddleware, async (req, res) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();

  if (userOrgId !== orgId) {
    return res.status(403).send({ error: 'User does not have permission' });
  }

  try {
    const org = await Org.findById(orgId);

    if (org?.integrations == null) {
      return res.send({ integrations: { github: false, notion: false, vscode: false, slack: false } });
    }

    const isVSCodeInstalled = await checkIfUserHasVSCodeInstalled(res.locals.user.userId);
    const integrations = {
      github: org.integrations.github?.installations != null,
      notion: org.integrations.notion?.access_token != null,
      slack: org.integrations.slack?.accessToken != null,
      google: org.integrations.google?.access_token != null,
      vscode: isVSCodeInstalled, // dependent on the user
    };

    return res.send({ integrations });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

orgRouter.get('/repos', userMiddleware, async (_, res) => {
  const orgId = res.locals.user.org.toString();

  try {
    const org = await Org.findById(orgId);
    if (org?.integrations?.github?.installations == null) {
      return res.send({ repos: [] });
    }

    const allRepos: string[] = [];
    org.integrations.github.installations.map((installation: any) => {
      installation.repositories.forEach((repo: { name: string }) => {
        allRepos.push(repo.name);
      });
    });

    return res.send({ repos: allRepos });
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

    const redirectUrl = `https://${org.subdomain}.mintlify.com/api/auth/landing?sessionToken=${newSessionToken}`;

    track(user.userId, 'Create Organization', {
      name: orgName,
      subdomain,
      from: 'webflow',
    });

    // Send new organization welcome email
    // await sendEmail(emails[0].email, undefined, 'welcome-new-organization', [{ name: 'org_url', content: org.subdomain }]);

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

  await Org.findByIdAndUpdate(res.locals.user.org, {
    'access.mode': mode,
  });

  return res.end();
});

orgRouter.put('/testSlack', async (req, res) => {
  const { orgId, docId } = req.body;
  const org = await Org.findById(orgId);
  const doc = await Doc.findById(docId);
  const fakeEvent: EventType = {
    org: orgId,
    doc: docId,
    type: 'change',
    change: [
      {
        count: 1,
        removed: true,
        value: "fix"
      }
    ]
  }
  if (org == null || doc == null) {
    return res.end()
  }
  await slackAutomationForEvent(fakeEvent, org, doc);
  return res.end();
})

export default orgRouter;
