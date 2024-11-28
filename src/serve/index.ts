import { contentType } from "@std/media-types/content-type";
import { CONTROL_CODE } from "../features/control-codes.ts";
import { deepMerge, type DeepMergeOptions } from "@cross/deepmerge";
import { eTag, ifMatch, ifNoneMatch } from "@std/http/etag";
import { HEADER } from "@std/http/unstable-header";
import { METHOD } from "@std/http/unstable-method";
import { resolveMetadata } from "../lib/metadata.ts";
import { serveDir, type ServeDirOptions } from "@std/http/file-server";
import { STATUS_CODE } from "@std/http/status";
import * as h from "./helpers.ts";
import type { JSX, VNode } from "preact";
import type { RouterData } from "../router/index.ts";
import type * as Lib from "../lib/types.ts";

export interface ServeOptions {
    isError: boolean;
    isNotFound: boolean;
    importFn: <T>(path: string) => T | Promise<T>;
    router: (req: Request) => RouterData | Promise<RouterData>;
    staticOptions?: ServeDirOptions;
    renderJSX: JSXRenderFn;
}

// deno-lint-ignore no-explicit-any ban-types
type JSXRenderFn<P = {}> = (vnode: VNode<P>, context?: any) => string | Promise<string>;

interface RenderObject {
    render: JSX.Element;
    metadata: Lib.Metadata;
}

interface LayoutInitObject {
    layout: Lib.Layout;
    downstream: unknown;
}

const NO_CONTENT_RESPONSE = h.createStandardResponse(STATUS_CODE.NoContent);
const METHOD_NOT_ALLOWED_RESPONSE = h.createStandardResponse(STATUS_CODE.MethodNotAllowed);
const NOT_FOUND_RESPONSE = h.createStandardResponse(STATUS_CODE.NotFound);
const ERROR_RESPONSE = h.createStandardResponse(STATUS_CODE.InternalServerError);

export async function serve(req: Request, res: Response, opts: ServeOptions): Promise<Response> {
    const pathname = new URL(req.url).pathname;
    const serveNotFound = async () => await serve(req, res, { ...opts, isNotFound: true });
    const serveError = async () => await serve(req, res, { ...opts, isError: true });

    const staticResponse = await serveDir(req, opts.staticOptions);
    if (h.shouldServeStatic(staticResponse, pathname)) return staticResponse;

    const routerData = await opts.router(req);
    const { urlParams, urlSearchParams } = routerData;
    const baseCtx: Lib.BaseCtx = { req, res, pathname, urlParams, urlSearchParams };
    const [document, layoutClasses, routeHandler, PageClass] = await h.getImports(routerData, opts);

    handleRouteHandler: if (routeHandler) {
        hasHandler: if (req.method in routeHandler) {
            const handler = routeHandler[<keyof typeof routeHandler>req.method];
            if (!handler) break hasHandler;
            const ctx: Lib.RouteHandlerCtx = { ...baseCtx, urlParams, urlSearchParams };
            return (await handler(ctx)) ?? NO_CONTENT_RESPONSE;
        }
        if (req.method === METHOD.Get && routerData.pages.default) break handleRouteHandler;
        return METHOD_NOT_ALLOWED_RESPONSE;
    }

    if ([METHOD.Get, METHOD.Head].every(m => m !== req.method)) return METHOD_NOT_ALLOWED_RESPONSE;
    if (!PageClass) return opts.isError ? ERROR_RESPONSE : NOT_FOUND_RESPONSE;

    const pageClassCtx: Lib.PageClassCtx = baseCtx;
    const pageConfig = await PageClass.config?.(pageClassCtx);
    if (pageConfig?.disinheritLayout) layoutClasses.length = 0;

    const upstreamArr: unknown[] = [];
    upstreamArr.push(await PageClass.upstream?.(pageClassCtx));
    const getPrevUpstream = (): unknown => upstreamArr.at(-1);

    for await (const LayoutClass of layoutClasses) {
        const prevUpstream = getPrevUpstream();
        const layoutClassCtx: Lib.LayoutClassCtx = { ...baseCtx, upstream: prevUpstream };
        const upstream = await LayoutClass.upstream?.(layoutClassCtx);
        if (upstream) upstreamArr.push(upstream);
    }

    let output: RenderObject;
    const layouts: LayoutInitObject[] = [];
    const getPrevDownstream = (): unknown => layouts.at(-1)?.downstream;

    for await (const LayoutClass of layoutClasses) {
        const prevDownstream = getPrevDownstream();
        const upstream = upstreamArr.pop();
        const layoutCtx: Lib.LayoutCtx = { ...baseCtx, upstream, downstream: prevDownstream };
        const layout = new LayoutClass(layoutCtx);
        const initResult = await layout.init?.();
        if (initResult instanceof Response) return initResult;
        if (initResult === CONTROL_CODE.NotFound) return serveNotFound();
        if (initResult === CONTROL_CODE.ServerError) return serveError();
        const downstream = await layout.downstream?.();
        layouts.push({ layout, downstream: deepMerge(prevDownstream, downstream) });
    }

    {
        const pageCtx: Lib.PageCtx = { ...baseCtx, downstream: getPrevDownstream() };
        const pageInstance = new PageClass(pageCtx);
        const initResult = await pageInstance.init?.();
        if (initResult instanceof Response) return initResult;
        if (initResult === CONTROL_CODE.NotFound) return serveNotFound();
        if (initResult === CONTROL_CODE.ServerError) return serveError();
        const render = await pageInstance.render?.();
        const metadata = (await pageInstance.metadata?.()) ?? {};
        output = { render, metadata };
    }

    for (const { layout } of layouts.toReversed()) {
        const children = output.render;
        output.render = await layout.render?.(children);
        const metadata = (await layout.metadata?.()) ?? {};
        const mergeOptions: DeepMergeOptions = { arrayMergeStrategy: "combine" };
        output.metadata = deepMerge.withOptions(mergeOptions, metadata, output.metadata);
    }

    const head = resolveMetadata(output.metadata);
    const body = await opts.renderJSX(output.render);
    const documentCtx: Lib.DocumentCtx = { ...baseCtx, head, body };
    const render = await document(documentCtx);

    notmodified: {
        const etag = await eTag(render);
        res.headers.set(HEADER.ETag, etag);
        const ifNoneMatchValue = req.headers.get(HEADER.IfNoneMatch);
        const ifMatchValue = req.headers.get(HEADER.IfMatch);
        const ifNoneMatchSatisfies = ifNoneMatch(ifNoneMatchValue, etag);
        const ifMatchSatisfies = ifMatch(ifMatchValue, etag);
        const match = !ifNoneMatchSatisfies || ifMatchSatisfies;
        if (!match) break notmodified;
        return h.createStandardResponse(STATUS_CODE.NotModified, { headers: res.headers });
    }

    res.headers.set(HEADER.ContentType, contentType("text/html"));
    res.headers.set(HEADER.ContentLength, new TextEncoder().encode(render).byteLength.toString());

    const init: ResponseInit = {};
    init.headers = res.headers;
    init.status = res.status;
    init.statusText = res.statusText;
    if (!routerData.pages.default) init.status = STATUS_CODE.NotFound;
    if (opts.isNotFound) init.status = STATUS_CODE.NotFound;
    if (opts.isError) init.status = STATUS_CODE.InternalServerError;

    const isHead = req.method === METHOD.Head;
    const responseBody = isHead ? null : render;
    return new Response(responseBody, init);
}
