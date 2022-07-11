import * as vscode from 'vscode';

import { Doc, ViewProvider } from './viewProvider';
import { getGitData, getRepoInfo } from '../utils/git';
import { getHighlightedText } from '../utils';
import GlobalState from '../utils/globalState';
import { getLinks } from '../utils/links';
import axios from 'axios';
import { API_ENDPOINT } from '../utils/api';
import { CodeReturned } from '../treeviews/connections';

export const linkCodeCommand = (provider: ViewProvider) => {
    return vscode.commands.registerCommand('mintlify.link-code', async (args) => {
        const editor = args.editor || vscode.window.activeTextEditor;

        const { scheme } = args;
        if (scheme !== 'file') {
            return;
        }

        if (editor) {
            const fileFsPath: string = editor.document.uri.fsPath;
            const { selection, highlighted } = getHighlightedText(editor);
            if (highlighted) {
                const selectedLines: number[] = [selection.start.line, selection.end.line];
                await getGitData(fileFsPath, provider, 'lines', 'code', selectedLines);
            } else {
                await getGitData(fileFsPath, provider, 'file', 'code');
            }
        }
    });
};

const getIsFolder = (fileStat: vscode.FileStat): boolean => fileStat.type === 2;
const getIsFile = (fileStat: vscode.FileStat): boolean => fileStat.type === 1;

export const linkDirCommand = (provider: ViewProvider) => {
    return vscode.commands.registerCommand('mintlify.link-dir', async (args) => {
        const { path, scheme } = args;
        if (scheme !== 'file') {
            return;
        }
        const uri: vscode.Uri = vscode.Uri.file(path);

        // most likely evoked from sidebar
        // figure out if it's a folder or file, get git info (git blame)
        const fileStat: vscode.FileStat = await vscode.workspace.fs.stat(uri);
        const isFolder = getIsFolder(fileStat);
        if (isFolder) {
            // git stuff for folder
            const fileFsPath: string = uri.fsPath;
            await getGitData(fileFsPath, provider, 'folder', 'dir');
        }
        const isFile = getIsFile(fileStat);
        if (isFile) {
            // git stuff for file
            const fileFsPath: string = uri.fsPath;
            await getGitData(fileFsPath, provider, 'file', 'dir');
        }
    });
};

export const refreshLinksCommand = (globalState: GlobalState) => {
    return vscode.commands.registerCommand('mintlify.refresh-links', async (args) => {
        const window = vscode.window;
        const editor = args?.editor || window.activeTextEditor;
        const fileFsPath: string = editor.document.uri.fsPath;
        const { gitOrg, repo } = await getRepoInfo(fileFsPath);
        globalState.setGitOrg(gitOrg);
        globalState.setRepo(repo);
        const links = await getLinks(globalState);
        globalState.setLinks(links);
    });
};

export const openDocsCommand = () => {
    return vscode.commands.registerCommand('mintlify.open-doc', async (url) => {
        vscode.env.openExternal(vscode.Uri.parse(url));
    });
};

export const openPreviewCommand = () => {
    return vscode.commands.registerCommand('mintlify.preview-doc', async (doc: Doc) => {
        const panel = vscode.window.createWebviewPanel(
			'mintlify.preview',
			doc.title,
			{
				viewColumn: vscode.ViewColumn.Two,
				preserveFocus: true,
			},
			{
				enableScripts: true
			}
		);

		try {
			const url = doc.url;
			const { data: hyperbeamIframeUrl } = await axios.get(`${API_ENDPOINT}/links/iframe`, {
				params: {
					url
				}
			});
			const iframe = `<iframe src="${hyperbeamIframeUrl}" style="position:fixed;border:0;width:100%;height:100%"></iframe>`;
			panel.webview.html = iframe;
		} catch {
			panel.dispose();
			vscode.env.openExternal(vscode.Uri.parse(doc.url));
		}
    });
};

export const prefillDocCommand = (viewProvider: ViewProvider) => {
    return vscode.commands.registerCommand('mintlify.prefill-doc', async (doc: Doc) => {
		vscode.commands.executeCommand('mintlify.preview-doc', doc);
		viewProvider.prefillDoc(doc);
	});
}

export const highlightConnectionCommand = () => {
    return vscode.commands.registerCommand('mintlify.highlight-connection', async (code: CodeReturned) => {
		if (code.line != null && code.endLine != null) {
			const rootPath = vscode.workspace.workspaceFolders![0].uri.path;
			const filePathUri  = vscode.Uri.parse(`${rootPath}/${code.file}`);
			const selectedRange = new vscode.Range(code.line, 0, code.endLine, 9999);
			vscode.window.activeTextEditor?.revealRange(selectedRange);
			await vscode.window.showTextDocument(filePathUri, {
				selection: selectedRange,
				preserveFocus: true,
			});
		}
	});
}