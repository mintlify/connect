import express from 'express';
import { Alert, AlertsRequest } from '../helpers/github/types';
import Code, { CodeType } from '../models/Code';
import { codeToAlert, didChange } from '../helpers/routes/alerts';
import { FileInfo } from '../helpers/github/patch';

const alertsRouter = express.Router();

alertsRouter.post('/', async (req, res) => {
    const alertsRequest: AlertsRequest = req.body;
    const { files, owner, repo } = alertsRequest;

    if (files == null || owner == null || repo == null) return res.status(400).end();

    const codes = await Code.find({ org: owner, repo });
    if (codes.length === 0) {
        return res.status(200).send({alerts: []});
    }

    const alertPromises: Promise<Alert|null>[] = [];
    codes.map((code: CodeType) => {
        switch (code.type) {
            case 'file':
                files.map((file) => {
                    if (file.filename.endsWith(code.file) || code.file.endsWith(file.filename)) {
                        alertPromises.push(codeToAlert(code, file));
                    }
                });
                break;
            case 'folder':
                files.map((file) => {
                    if (file.filename.includes(code.file)) {
                        alertPromises.push(codeToAlert(code, file));
                    }
                });
                break;
            case 'lines':
                files.map((file: FileInfo) => {
                    if (didChange(code, file)) {
                        alertPromises.push(codeToAlert(code, file));
                    }
                });
                break;
        }
    });

    const alertResponses = await Promise.all(alertPromises);
    const alerts = alertResponses.filter((alert) => alert != null);

    return res.status(200).send({alerts});
});

export default alertsRouter;
