import { join as joinPaths } from 'path';
import { GlyphChars } from '../glyphChars';
import { any } from '../';
import { Stopwatch } from './stopwatch';
import { findExecutable, run } from './shell';
import { LogLevel } from './logger';

export class UnableToFindGitError extends Error {
    constructor(public readonly original?: Error) {
        super('Unable to find git');

        Error.captureStackTrace?.(this, UnableToFindGitError);
    }
}

export class InvalidGitConfigError extends Error {
    constructor(public readonly original: Error) {
        super('Invalid Git configuration');

        Error.captureStackTrace?.(this, InvalidGitConfigError);
    }
}

export interface GitLocation {
    path: string;
    version: string;
}

function parseVersion(raw: string): string {
    return raw?.replace(/^git version /, '');
}

async function findSpecificGit(path: string): Promise<GitLocation> {
    const sw = new Stopwatch(`findSpecificGit(${path})`, { logLevel: LogLevel.Debug });

    let version;
    try {
        version = await run<string>(path, ['--version'], 'utf8');
    } catch (ex) {
        sw.stop({ message: ` ${GlyphChars.Dot} Unable to find git` });

        if (/bad config/i.test(ex.message)) throw new InvalidGitConfigError(ex);
        throw ex;
    }

    // If needed, let's update our path to avoid the search on every command
    if (!path || path === 'git') {
        const foundPath = findExecutable(path, ['--version']).cmd;

        // Ensure that the path we found works
        try {
            version = await run<string>(foundPath, ['--version'], 'utf8');
        } catch (ex) {
            sw.stop({ message: ` ${GlyphChars.Dot} Unable to find git` });

            if (/bad config/i.test(ex.message)) throw new InvalidGitConfigError(ex);
            throw ex;
        }

        path = foundPath;
    }

    sw.stop({ message: ` ${GlyphChars.Dot} Found git @ ${path}` });

    return {
        path: path,
        version: parseVersion(version.trim()),
    };
}

async function findGitDarwin(): Promise<GitLocation> {
    try {
        const path = (await run<string>('which', ['git'], 'utf8')).trim();
        if (path !== '/usr/bin/git') return findSpecificGit(path);

        try {
            await run<string>('xcode-select', ['-p'], 'utf8');
            return findSpecificGit(path);
        } catch (ex) {
            if (ex.code === 2) {
                return Promise.reject(new UnableToFindGitError(ex));
            }
            return findSpecificGit(path);
        }
    } catch (ex) {
        return Promise.reject(
            ex instanceof InvalidGitConfigError || ex instanceof UnableToFindGitError
                ? ex
                : new UnableToFindGitError(ex),
        );
    }
}

function findSystemGitWin32(basePath: string | null | undefined): Promise<GitLocation> {
    if (basePath == null || basePath.length === 0) return Promise.reject(new UnableToFindGitError());
    return findSpecificGit(joinPaths(basePath, 'Git', 'cmd', 'git.exe'));
}

function findGitWin32(): Promise<GitLocation> {
    return findSystemGitWin32(process.env['ProgramW6432'])
        .then(null, () => findSystemGitWin32(process.env['ProgramFiles(x86)']))
        .then(null, () => findSystemGitWin32(process.env['ProgramFiles']))
        .then(null, () => findSpecificGit('git'));
}

export async function findGitPath(
    paths: string | string[] | null | undefined,
    search: boolean = true,
): Promise<GitLocation> {
    try {
        if (paths == null || typeof paths === 'string') {
            return await findSpecificGit(paths ?? 'git');
        }

        try {
            return any(...paths.map(p => findSpecificGit(p)));
        } catch (ex) {
            throw new UnableToFindGitError(ex);
        }
    } catch (ex) {
        if (!search) {
            return Promise.reject(
                ex instanceof InvalidGitConfigError || ex instanceof UnableToFindGitError
                    ? ex
                    : new UnableToFindGitError(ex),
            );
        }

        try {
            switch (process.platform) {
                case 'darwin':
                    return await findGitDarwin();
                case 'win32':
                    return await findGitWin32();
                default:
                    return Promise.reject(new UnableToFindGitError());
            }
        } catch (ex) {
            return Promise.reject(
                ex instanceof InvalidGitConfigError || ex instanceof UnableToFindGitError
                    ? ex
                    : new UnableToFindGitError(ex),
            );
        }
    }
}
