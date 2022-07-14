import {
	CancellationToken,
	CodeLens,
	CodeLensProvider,
	Command,
	DocumentSelector,
	Event,
	EventEmitter,
	Range,
	TextDocument,
} from 'vscode';
import { Commands, ContextKeys, Schemes } from '../../constants';
import { Container } from '../../container';
import { getContext } from '../../context';
import { GitBlame } from '../../git/models';
import { getFilePath } from '../../mintlify-functionality/utils/git';
import { mapOldPositionToNew } from '../../mintlify-functionality/utils/git/diffPositionMapping';
import { Link } from '../../mintlify-functionality/utils/links';

export class DocCodeLensProvider implements CodeLensProvider {
	static selector: DocumentSelector = [
		{ scheme: Schemes.File },
		{ scheme: Schemes.Git },
		{ scheme: Schemes.GitLens },
		{ scheme: Schemes.PRs },
		{ scheme: Schemes.Vsls },
		{ scheme: Schemes.VslsScc },
		{ scheme: Schemes.Virtual },
		{ scheme: Schemes.GitHub },
	];
	private _onDidChangeCodeLenses = new EventEmitter<void>();
	get onDidChangeCodeLenses(): Event<void> {
		return this._onDidChangeCodeLenses.event;
	}

	constructor(private readonly container: Container) {}

	reset(_reason?: 'idle' | 'saved') {
		this._onDidChangeCodeLenses.fire();
	}

	async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
		const trackedDocument = await this.container.tracker.getOrAdd(document);
		if (!trackedDocument.isBlameable) return [];

		let dirty = false;
		if (document.isDirty) {
			// Only allow dirty blames if we are idle
			if (trackedDocument.isDirtyIdle) {
				const maxLines = this.container.config.advanced.blame.sizeThresholdAfterEdit;
				if (maxLines > 0 && document.lineCount > maxLines) {
					dirty = true;
				}
			} else {
				dirty = true;
			}
		}

		const lenses: CodeLens[] = [];

		const links: Link[] | undefined = getContext<Link[]>(ContextKeys.Links);
		if (links == null || links?.length === 0) {
			return lenses;
		}
		const fileFsPath: string = document.uri.fsPath;
		const fileName = getFilePath(fileFsPath);
		const relatedLinks = links.filter(link => {
			return link.file === fileName || fileName.includes(link.file) || link.file.includes(fileName);
		});

		const gitUri = trackedDocument.uri;
		let blame: GitBlame | undefined;

		if (!dirty) {
			if (token.isCancellationRequested) return lenses;
			blame = await this.container.git.getBlame(gitUri, document);
			if (blame == null || blame?.lines.length === 0) return lenses;
		}

		// TODO - seprate promises from non-promise lenses
		const lensPromises: Promise<CodeLens | undefined>[] = relatedLinks.map(async link => {
			let firstLine = document.lineAt(0);
			let lastLine = document.lineAt(document.lineCount - 1);
			if (link.type === 'lines' && link?.line && link?.endLine) {
				if (document.isDirty) {
					return;
				}
				try {
					const diffForFileContents = await this.container.git.getDiffForFileContents(
						gitUri,
						fileName,
						link.sha,
					);
					console.log({ diffForFileContents: diffForFileContents });
					let diff = diffForFileContents?.diff;
					if (diff == null && diffForFileContents?.hunks != null && diffForFileContents.hunks.length > 0) {
						diff = diffForFileContents.hunks[0].diff;
					}
					if (diff != null) {
						firstLine = document.lineAt(mapOldPositionToNew(diff, link.line));
						lastLine = document.lineAt(mapOldPositionToNew(diff, link.endLine) - 1);
					}
				} catch {
					return;
				}
			}
			if (lastLine.lineNumber > document.lineCount - 1) {
				lastLine = document.lineAt(document.lineCount - 1);
			}
			if (firstLine.lineNumber < 0) {
				firstLine = document.lineAt(0);
			}
			const range = new Range(firstLine.range.start, lastLine.range.end);
			const title = this.formatTitle(link);
			const command: Command = {
				command: Commands.PreviewDoc,
				title: title,
				arguments: [{ doc: link.doc }],
			};
			const lens: CodeLens = new CodeLens(range, command);
			return lens;
		});

		if (token.isCancellationRequested) return lenses;

		const resolvedLenses = await Promise.all(lensPromises);
		const filteredLens = resolvedLenses.filter(lens => lens != null) as CodeLens[];

		return filteredLens;
	}

	private formatTitle(link: Link): string {
		let formattedTitle = link.doc?.title;
		if (formattedTitle == null) {
			return 'Go to document';
		}
		if (formattedTitle.length > 30) {
			formattedTitle = `${formattedTitle.slice(0, 30)}...`;
		}
		return formattedTitle;
	}
}
