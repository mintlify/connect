import { NextApiResponse } from "next";
import { getOrgFromSubdomain, getSubdomain, getUserFromUserId } from "../../helpers/user";
import { withSession } from "../../lib/withSession";

async function handler(req: any, res: NextApiResponse) {
  const session = req.session.get('user');

  if (session?.userId == null) {
    return res.end();
  }

  const user = await getUserFromUserId(session.userId);
  const subdomain = getSubdomain(req.headers.host);
  const org = await getOrgFromSubdomain(subdomain, session.userId);

  res.send({ user, org });
}

export default withSession(handler);