import { join } from "@std/path/join";
import * as sys from "../dev/runtime.ts";
import type { RouterData, RouterOptions, DirPattern } from "./index.ts";

export function initRouterData(fsRoot: string, urlSearchParams: URLSearchParams): RouterData {
    return {
        dir: fsRoot,
        layouts: [],
        pages: {},
        urlParams: {},
        urlSearchParams: urlSearchParams,
    };
}

export function acquireJoinPath(base: string): (path: string) => string {
    return function (path: string): string {
        return join(base, path);
    };
}

export interface PathsInDir {
    document?: string;
    layout?: string;
    routeHandler?: string;
    pages: { default?: string; notFound?: string; error?: string };
}

async function getFile(dir: string, pattern: RegExp): Promise<string | undefined> {
    for await (const { name } of sys.readDir(dir) ?? []) if (pattern.test(name)) return name;
}

export async function getPathsInDir(
    dir: string,
    patterns: RouterOptions["patterns"]
): Promise<PathsInDir> {
    return {
        document: await getFile(dir, patterns.document),
        layout: await getFile(dir, patterns.layout),
        routeHandler: await getFile(dir, patterns.routeHandler),
        pages: {
            default: await getFile(dir, patterns.pages.default),
            notFound: await getFile(dir, patterns.pages.notFound),
            error: await getFile(dir, patterns.pages.error),
        },
    };
}

function testDirEntry(entry: Deno.DirEntry, pattern: RegExp): boolean {
    return entry.isDirectory && pattern.test(entry.name);
}

export async function getGroupsToDir(
    path: string,
    targetDir: string,
    groupPattern: RegExp,
    acc: string[]
): Promise<string[] | undefined> {
    const joinPath = acquireJoinPath(path);
    if (await sys.dirExists(joinPath(targetDir))) return acc;
    for await (const entry of sys.readDir(path) ?? []) {
        if (!testDirEntry(entry, groupPattern)) continue;
        acc.push(entry.name);
        const next = await getGroupsToDir(join(entry.name), targetDir, groupPattern, acc);
        if (next) return next;
    }
}

export async function getPatternDirName(
    path: string,
    dirPattern: DirPattern
): Promise<string | undefined> {
    for await (const entry of sys.readDir(path) ?? []) {
        if (!testDirEntry(entry, dirPattern.pattern)) continue;
        return dirPattern.getName(entry.name);
    }
}

export async function getGroupsToPatternDir(
    path: string,
    targetDirPattern: DirPattern,
    groupPattern: RegExp,
    acc: string[]
): Promise<string[] | undefined> {
    const joinPath = acquireJoinPath(path);
    if (await getPatternDirName(path, targetDirPattern)) return acc;
    for await (const entry of sys.readDir(path) ?? []) {
        if (!testDirEntry(entry, groupPattern)) continue;
        acc.push(entry.name);
        const [t, g] = <const>[targetDirPattern, groupPattern];
        const next = await getGroupsToPatternDir(joinPath(entry.name), t, g, acc);
        if (next) return next;
    }
}
