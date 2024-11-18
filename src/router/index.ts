import * as h from "./helpers.ts";
import * as sys from "../dev/runtime.ts";
import type * as R from "../dev/router.types.ts";
export type * from "../dev/router.types.ts";

import { List } from "@exts/list";

export async function router(req: Request, opts: R.RouterOptions): Promise<R.PathData> {
    const pathname = new URL(req.url).pathname;
    const segments = new List(...pathname.split("/").filter(Boolean).concat("<FILE>"));
    return await getPathData(req, segments, opts);
}

async function getPathData(
    req: Request,
    segments: List<string>,
    opts: R.RouterOptions
): Promise<R.PathData> {
    const data = h.initPathData(req, opts.fsRoot);

    for (const seg of segments.items) {
        const dir = data.paths.dir;
        const join = h.joinerFactory(dir);
        const s = await h.getStaticPaths(dir, opts.patterns);
        if (s.document) data.paths.document = join(s.document);
        if (s.layout) data.paths.layouts.push(join(s.layout));
        if (s.page.notFound) data.paths.page.notFound = join(s.page.notFound);
        if (s.page.error) data.paths.page.error = join(s.page.error);

        if (seg.isLast && s.page.default) data.paths.page.default = join(s.page.default);
        if (seg.isLast) return data;

        if (await sys.dirExists(join(seg.value))) {
            data.paths.dir = join(seg.value);
            continue;
        }

        const groupRegex = opts.patterns.dir.group;
        const groupsToDir = await h.getGroupsToDir(dir, seg.value, groupRegex, []);
        if (groupsToDir) seg.insertAfter(...groupsToDir.concat(seg.value));
        if (groupsToDir) continue;

        const dynamicPattern = opts.patterns.dir.dynamic;
        const dynamicDirName = await h.getPatternDirName(dir, dynamicPattern);
        if (dynamicDirName) {
            data.paths.dir = join(dynamicPattern.rebuild(dynamicDirName));
            data.url.params[dynamicDirName] = seg.value;
            continue;
        }

        const groupsToDynDir = await h.getGroupsToPatternDir(dir, groupRegex, dynamicPattern, []);
        if (groupsToDynDir) seg.insertAfter(...groupsToDynDir.concat(seg.value));
        if (groupsToDynDir) continue;

        const catchAllPattern = opts.patterns.dir.catchAll;
        const catchAllDirName = await h.getPatternDirName(dir, catchAllPattern);
        if (catchAllDirName) {
            data.paths.dir = join(catchAllPattern.rebuild(catchAllDirName));
            const params = [seg.value];
            while (seg.next.isNotLast) params.push(seg.extractNext()!.value);
            data.url.params[catchAllDirName] = params;
            continue;
        }

        const groupsToCADir = await h.getGroupsToPatternDir(dir, groupRegex, catchAllPattern, []);
        if (groupsToCADir) seg.insertAfter(...groupsToCADir.concat(seg.value));
        if (groupsToCADir) continue;

        return data;
    }

    return data;
}
