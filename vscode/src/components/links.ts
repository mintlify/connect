import vscode from 'vscode';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import GlobalState from '../utils/globalState';
import { getRepoInfo } from '../utils/git';

export type Link = {
    _id: string;
    doc: Object;
    sha: string;
    provider: string;
    file: string;
    org: string;
    gitOrg: string;
    repo: string;
    type: string;
    url: string;
    branch?: string;
    line?: number;
    endLine?: number;
};

export const getLinks = async (globalState: GlobalState): Promise<Link[]> => {
    const subdomain = globalState.getSubdomain();
    const userId = globalState.getUserId();
    if (subdomain == null || userId == null) { return []; } // TODO - proper error handling
    const repo = globalState.getRepo();
    const gitOrg = globalState.getGitOrg();
    try {
        const codesResponse = await axios.get(`${API_ENDPOINT}/links`, {
            params: { userId, subdomain, repo, gitOrg }
        });
        return codesResponse.data.codes;
    } catch (err) {
        console.log(err);
        return [];
    }

};

export const refreshLinksCommand = (globalState: GlobalState) => {
    return vscode.commands.registerCommand('mintlify.refresh-links', async (args) => {
        const window = vscode.window;
        const editor = args.editor || window.activeTextEditor;
        const fileFsPath: string = editor.document.uri.fsPath;
        const { gitOrg, repo } = await getRepoInfo(fileFsPath);
        globalState.setGitOrg(gitOrg);
        globalState.setRepo(repo);

        const links = await getLinks(globalState);
        globalState.setLinks(links);
    });
};