// https://www.notion.so/mintlify/Connect-d9d337715f974520a793da685b056415
import express from 'express';
import { ConnectFile, Alert } from '../../helpers/types';
import { createNewLinksMessage, getAlertsForAllFiles } from '../../helpers/alerts';
import { track } from 'services/segment';
import AuthConnector from 'models/AuthConnector';
import { sha512Hash } from 'helpers/hash';

type AlertsRequest = {
    files: ConnectFile[],
    owner: string,
    installationId: string,
}

const v01Router = express.Router();

const getAuthConnector = (sourceId: string) => {
    const hashedSourceId = sha512Hash(sourceId);
    return AuthConnector.findOne({hashedSourceId});
}

v01Router.post('/', async (req, res) => {
    const { files, owner, installationId } : AlertsRequest = req.body;

    if (files == null) return res.status(400).end();
    if (owner == null) return res.status(400).end();

    const authConnector = await getAuthConnector(owner);
    const allAlerts = await getAlertsForAllFiles(files, authConnector);
    const alerts = allAlerts.filter((alert) => alert.type !== 'new');

    const newLinks: Alert[] = allAlerts.filter((alert) => alert.type === 'new');
    const newLinksMessage = newLinks.length > 0 ? await createNewLinksMessage(newLinks, authConnector) : null;

    console.log(installationId);

    // logging
    const isAlerting = alerts.length > 0;
    const alertEvent = isAlerting ? 'Connect Alert' : 'Connect Not Alert';
    track(owner, alertEvent, {
        numberOfFiles: files.length,
        numberOfAlerts: alerts.length
    });

    return res.status(200).send({
        alerts,
        newLinksMessage
    });
});

v01Router.get('/install', async (_, res) => {
    track('connect-temp', 'Install Connect GitHub App');
    return res.redirect('https://mintlify.notion.site/Mintlify-Connect-c77063caf3f6492e85badd026b769a69');
})

export default v01Router;