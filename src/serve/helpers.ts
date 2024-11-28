import { STATUS_CODE, STATUS_TEXT, type StatusCode } from "@std/http/status";
import * as sys from "../dev/runtime.ts";
import type { RouterData } from "../router/index.ts";
import type { ServeOptions } from "./index.ts";
import type * as Lib from "../lib/types.ts";

const NULL_BODY_STATUS = <StatusCode[]>[
    STATUS_CODE.SwitchingProtocols,
    STATUS_CODE.NoContent,
    STATUS_CODE.ResetContent,
    STATUS_CODE.NotModified,
];

export function createStandardResponse(status: StatusCode, init?: ResponseInit): Response {
    const statusText = STATUS_TEXT[status];
    const isNullBodyStatus = NULL_BODY_STATUS.includes(status);
    const body = isNullBodyStatus ? null : statusText;
    return new Response(body, { status, statusText, ...init });
}

export function shouldServeStatic(res: Response, pathname: string): boolean {
    if (res.status !== STATUS_CODE.NotFound) return true;
    if (pathname.includes(".")) return true;
    return false;
}

async function importDocument(
    importFn: <T>(path: string) => T | Promise<T>,
    path: string
): Promise<Lib.Document> {
    const mod = await sys.importDynamic<{ default?: Lib.Document }>(importFn, path);
    if (mod?.default) return mod.default;
    throw new TypeError(`Document at ${path} must be a default export.`);
}

async function importLayouts(
    importFn: <T>(path: string) => T | Promise<T>,
    paths: string[]
): Promise<Lib.LayoutClass[]> {
    const callbackFn = async (path: string) => {
        const mod = await sys.importDynamic<{ default?: Lib.LayoutClass }>(importFn, path);
        if (mod?.default) return mod.default;
        throw new TypeError(`Layout at ${path} must be a default export.`);
    };
    return await Promise.all(paths.map(callbackFn));
}

async function importRouteHandler(
    importFn: <T>(path: string) => T | Promise<T>,
    path: string
): Promise<Lib.RouteHandlerModule> {
    const mod = await sys.importDynamic<Lib.RouteHandlerModule>(importFn, path);
    if (mod) return mod;
    throw new TypeError(`Route handler at ${path} could not be imported.`);
}

async function importPage(
    importFn: <T>(path: string) => T | Promise<T>,
    path: string
): Promise<Lib.PageClass> {
    const mod = await sys.importDynamic<{ default?: Lib.PageClass }>(importFn, path);
    if (mod?.default) return mod.default;
    throw new TypeError(`Page at ${path} must be a default export.`);
}

export type Imports = readonly [
    Lib.Document,
    Lib.LayoutClass[],
    Lib.RouteHandlerModule | undefined,
    Lib.PageClass | undefined
];

export async function getImports(routerData: RouterData, opts: ServeOptions): Promise<Imports> {
    if (!routerData.document) throw new TypeError("Missing document.");
    const document = await importDocument(opts.importFn, routerData.document);
    const layouts = await importLayouts(opts.importFn, routerData.layouts);
    const routeHandler = routerData.routeHandler
        ? await importRouteHandler(opts.importFn, routerData.routeHandler)
        : undefined;
    const pagePath = opts.isError
        ? routerData.pages.error
        : opts.isNotFound
        ? routerData.pages.notFound
        : routerData.pages.default ?? routerData.pages.notFound;
    const page = pagePath ? await importPage(opts.importFn, pagePath) : undefined;
    return <const>[document, layouts, routeHandler, page];
}
