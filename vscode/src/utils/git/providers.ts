import { Container } from '../../container';
import { GitCommandOptions } from '../../git/commandOptions';
import { GitProvider } from '../../git/gitProvider';
// import { GitHubGitProvider } from '../../plus/github/githubGitProvider';
import { Git } from './git/git';
import { LocalGitProvider } from './localGitProvider';
import { VslsGit, VslsGitProvider } from './git/vslsGitProvider';

let gitInstance: Git | undefined;
function ensureGit() {
    if (gitInstance == null) {
        gitInstance = new Git();
    }
    return gitInstance;
}

export function git(_options: GitCommandOptions, ..._args: any[]): Promise<string | Buffer> {
    return ensureGit().git(_options, ..._args);
}

export async function getSupportedGitProviders(container: Container): Promise<GitProvider[]> {
    const git = ensureGit();

    const providers: GitProvider[] = [
        new LocalGitProvider(container, git),
        new VslsGitProvider(container, new VslsGit(git)),
    ];

    return providers;
}
