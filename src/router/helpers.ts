import * as sys from "../dev/runtime.ts";
import type * as R from "../dev/router.types.ts";

export function initPathData(req: Request, runtimeRoot: string): R.PathData {
    return {
        paths: {
            dir: runtimeRoot,
            document: "",
            layouts: [],
            page: {
                default: undefined,
                notFound: undefined,
                error: undefined,
            },
        },
        url: {
            params: {},
            searchParams: new URL(req.url).searchParams,
        },
    };
}

export function joinerFactory(base: string): (str: string) => string {
    return (str: string) => `${base}/${str}`;
}

async function getFile(dir: string, r: RegExp): Promise<string | undefined> {
    for await (const { name } of sys.readDir(dir) ?? []) if (r.test(name)) return name;
}

export async function getStaticPaths(
    dir: string,
    patterns: R.RouterOptions["patterns"]
): Promise<R.StaticPaths> {
    return {
        document: await getFile(dir, patterns.document),
        layout: await getFile(dir, patterns.layout),
        page: {
            default: await getFile(dir, patterns.page.default),
            notFound: await getFile(dir, patterns.page.notFound),
            error: await getFile(dir, patterns.page.error),
        },
    };
}

function entryIsDirAndTest(entry: Deno.DirEntry, r: RegExp): boolean {
    return entry.isDirectory && r.test(entry.name);
}

export async function getGroupsToDir(
    path: string,
    dir: string,
    r: RegExp,
    acc: string[]
): Promise<string[] | undefined> {
    const join = joinerFactory(path);
    if (await sys.dirExists(join(dir))) return acc;
    for await (const entry of sys.readDir(path) ?? []) {
        if (!entryIsDirAndTest(entry, r)) continue;
        acc.push(entry.name);
        const next = await getGroupsToDir(join(entry.name), dir, r, acc);
        if (next) return next;
    }
}

export async function getPatternDirName(
    path: string,
    p: R.RegexAndName
): Promise<string | undefined> {
    for await (const entry of sys.readDir(path) ?? []) {
        if (!entryIsDirAndTest(entry, p.pattern)) continue;
        return p.getName(entry.name);
    }
}

export async function getGroupsToPatternDir(
    path: string,
    r: RegExp,
    p: R.RegexAndName,
    acc: string[]
): Promise<string[] | undefined> {
    const join = joinerFactory(path);
    if (await getPatternDirName(path, p)) return acc;
    for await (const entry of sys.readDir(path) ?? []) {
        if (!entryIsDirAndTest(entry, r)) continue;
        acc.push(entry.name);
        const next = await getGroupsToPatternDir(join(entry.name), r, p, acc);
        if (next) return next;
    }
}
