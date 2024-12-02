/**
 * Provides the {@linkcode router} function for routing requests to a Neuf application.
 * Provide a {@linkcode RouterOptions} object to configure the router behaviour.
 *
 * @module
 */

import { List } from "@exts/list";
import { ROUTER_DEFAULTS } from "./defaults.ts";
import * as h from "./helpers.ts";
import * as sys from "../dev/runtime.ts";

export * from "./defaults.ts";

export interface RouterOptions {
    fsRoot: string;
    patterns: {
        document: RegExp;
        layout: RegExp;
        routeHandler: RegExp;
        pages: {
            default: RegExp;
            notFound: RegExp;
            error: RegExp;
        };
        dir: {
            dynamic: DirPattern;
            catchAll: DirPattern;
            group: RegExp;
        };
    };
}

export interface DirPattern {
    pattern: RegExp;
    getName: (fsName: string) => string;
    getFsName: (name: string) => string;
}

export interface RouterData {
    dir: string;
    document?: string;
    layouts: string[];
    routeHandler?: string;
    pages: { default?: string; notFound?: string; error?: string };
    urlParams: Record<string, unknown>;
    urlSearchParams: URLSearchParams;
}

export async function router(
    req: Request,
    opts: RouterOptions = ROUTER_DEFAULTS
): Promise<RouterData> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const urlSearchParams = url.searchParams;
    const segments = new List(...pathname.split("/").filter(Boolean).concat("<FILE>"));
    const data = h.initRouterData(opts.fsRoot, urlSearchParams);

    nextsegment: for (const seg of segments.items) {
        const joinPath = h.acquireJoinPath(data.dir);
        const s = await h.getPathsInDir(data.dir, opts.patterns);
        if (s.document) data.document = joinPath(s.document);
        if (s.layout) data.layouts.push(joinPath(s.layout));
        if (s.pages.notFound) data.pages.notFound = joinPath(s.pages.notFound);
        if (s.pages.error) data.pages.error = joinPath(s.pages.error);

        if (seg.isLast) {
            if (s.pages.default) data.pages.default = joinPath(s.pages.default);
            if (s.routeHandler) data.routeHandler = joinPath(s.routeHandler);
            break nextsegment;
        }

        if (await sys.dirExists(joinPath(seg.value))) {
            data.dir = joinPath(seg.value);
            continue nextsegment;
        }

        const groupPtn = opts.patterns.dir.group;
        const dynPtn = opts.patterns.dir.dynamic;
        const catchAllPtn = opts.patterns.dir.catchAll;

        const groupsToDir = await h.getGroupsToDir(data.dir, seg.value, groupPtn, []);
        if (groupsToDir) {
            seg.insertAfter(...groupsToDir.concat(seg.value));
            continue nextsegment;
        }

        const dynDirName = await h.getPatternDirName(data.dir, dynPtn);
        if (dynDirName) {
            data.dir = joinPath(dynPtn.getFsName(dynDirName));
            data.urlParams[dynDirName] = seg.value;
            continue nextsegment;
        }

        const groupsToDynDir = await h.getGroupsToPatternDir(data.dir, dynPtn, groupPtn, []);
        if (groupsToDynDir) {
            seg.insertAfter(...groupsToDynDir.concat(seg.value));
            continue nextsegment;
        }

        const catchAllDirName = await h.getPatternDirName(data.dir, catchAllPtn);
        if (catchAllDirName) {
            data.dir = joinPath(catchAllPtn.getFsName(catchAllDirName));
            const urlParams = [seg.value];
            while (seg.next.isNotLast) urlParams.push(seg.extractNext()!.value);
            data.urlParams[catchAllDirName] = urlParams;
            continue nextsegment;
        }

        const grpToCatchAllDir = await h.getGroupsToPatternDir(data.dir, catchAllPtn, groupPtn, []);
        if (grpToCatchAllDir) {
            seg.insertAfter(...grpToCatchAllDir.concat(seg.value));
            continue nextsegment;
        }

        break nextsegment;
    }

    return data;
}
