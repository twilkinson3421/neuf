import * as c from "../dev/constants.ts";
import * as h from "./helpers.ts";
import type * as N from "../dev/lib.types.ts";
import type * as S from "../dev/serve.types.ts";
export type * from "../dev/serve.types.ts";

import { deepMerge, type DeepMergeOptions } from "@cross/deepmerge";
import { METHOD } from "@std/http/unstable-method";
import { serveDir } from "@std/http/file-server";
import { Logger, INFO_CODE as IC } from "../dev/log.ts";

/**
 * Serves a request.
 * @param req The request object.
 * @param res The response object.
 * @param opts Configuration options for serving a Neuf application.
 * @returns A promise which resolves to a response.
 */
export async function serve(req: Request, res: Response, opts: S.ServeOptions): Promise<Response> {
    const logInfo = Logger.genLogNotSelf(req, Logger.info);
    if (opts.isNotFound) logInfo(IC.NotFoundControl);
    const pathname = new URL(req.url).pathname;

    const middlewares = await h.getMiddlewares(opts.importFn, opts.middleware);
    for (const middleware of middlewares) {
        if (middleware.options?.matcher && !middleware.options.matcher.test(pathname)) continue;
        logInfo(IC.GlobalMiddlewareInvoked, middleware.handler.name);
        const result = await middleware.handler(req, res);
        const doLog = (): true => logInfo(IC.GlobalMiddlewareResponse, middleware.handler.name);
        if (h.isRes(result)) return doLog() && result;
    }

    const staticResponse = await serveDir(req, opts.serveStaticOptions);
    if (h.shouldReturnStatic(pathname, staticResponse)) return staticResponse;

    const pathData = await opts.router(req);
    const { params, searchParams } = pathData.url;
    const baseCtx: N.BaseCtx = { req, res, pathname, params, searchParams };
    const staticImports = await h.getStaticImports(pathData, opts);
    const [DocumentFn, LayoutClasses, PageClass, RouteHandler] = staticImports;

    if (RouteHandler && h.validateRouteHandlerMethod(req.method)) {
        const handler = RouteHandler[req.method];
        if (handler) logInfo(IC.RouteHandlerInvoked, handler.name);
        if (handler) return (await handler(baseCtx)) ?? c.NO_CONTENT_RESPONSE;
        if (req.method !== METHOD.Get) return c.METHOD_NOT_ALLOWED_RESPONSE;
        if (!pathData.paths.page.default) return c.METHOD_NOT_ALLOWED_RESPONSE;
    }

    if (req.method !== METHOD.Get) return c.METHOD_NOT_ALLOWED_RESPONSE;
    if (!PageClass) return opts.isError ? c.ERROR_RESPONSE : c.NOT_FOUND_RESPONSE;

    const staticPageCtx: N.StaticPageCtx = baseCtx;
    const pageOptions = await PageClass.options?.(staticPageCtx);
    if (pageOptions?.ignoreLayout) logInfo(IC.PageIgnoreLayout, PageClass.name);
    if (pageOptions?.ignoreLayout) LayoutClasses.length = 0;

    const upstreamArr: N.Upstream[] = [];
    upstreamArr.push((await PageClass.upstream?.(staticPageCtx)) ?? {});
    const getPreviousUpstream = (): N.Upstream => upstreamArr.at(-1) ?? {};

    for await (const LayoutClass of LayoutClasses.toReversed()) {
        const previousUpstream = getPreviousUpstream();
        const staticLayoutCtx: N.StaticLayoutCtx = { ...baseCtx, upstream: previousUpstream };
        const middlewareResult = await LayoutClass.middleware?.(staticLayoutCtx);
        const doLog = (): true => logInfo(IC.LocalMiddlewareResponse, LayoutClass.name);
        if (h.isRes(middlewareResult)) return doLog() && middlewareResult;
        if (h.isNotFound(middlewareResult)) return serve(req, res, { ...opts, isNotFound: true });
        const upstream = (await LayoutClass.upstream?.(staticLayoutCtx)) ?? {};
        upstreamArr.push(deepMerge(previousUpstream, upstream));
    }

    const layouts = h.initLayouts();
    const getPreviousDownstream = (): N.Downstream => layouts.at(-1)?.downstream ?? {};

    for await (const LayoutClass of LayoutClasses) {
        const previousDownstream = getPreviousDownstream();
        const upstream = upstreamArr.pop() ?? {};
        const layoutCtx: N.LayoutCtx = { ...baseCtx, downstream: previousDownstream, upstream };
        const layoutInstance = new LayoutClass(layoutCtx);
        await layoutInstance.init?.();
        const responseResult = await layoutInstance.response?.();
        const doLog = (): true => logInfo(IC.LocalCustomResponse, LayoutClass.name);
        if (h.isRes(responseResult)) return doLog() && responseResult;
        if (h.isNotFound(responseResult)) return serve(req, res, { ...opts, isNotFound: true });
        const downstream = (await layoutInstance.downstream?.()) ?? {};
        const mergedDownstream = deepMerge(previousDownstream, downstream);
        layouts.push({ layout: layoutInstance, downstream: mergedDownstream });
    }

    const middlewareResult = await PageClass.middleware?.(staticPageCtx);
    const doLogM = (): true => logInfo(IC.LocalMiddlewareResponse, PageClass.name);
    if (h.isRes(middlewareResult)) return doLogM() && middlewareResult;
    if (h.isNotFound(middlewareResult)) return serve(req, res, { ...opts, isNotFound: true });
    const pageCtx: N.PageCtx = { ...baseCtx, downstream: getPreviousDownstream() };
    const pageInstance = new PageClass(pageCtx);
    await pageInstance.init?.();
    const responseResult = await pageInstance.response?.();
    const doLogR = (): true => logInfo(IC.LocalCustomResponse, PageClass.name);
    if (h.isRes(responseResult)) return doLogR() && responseResult;
    if (h.isNotFound(responseResult)) return serve(req, res, { ...opts, isNotFound: true });
    logInfo(IC.PageRender, PageClass.name);
    const pageRenderResult = await pageInstance.render();
    const pageMetadata = (await pageInstance.metadata?.()) ?? {};
    const [render, metadata] = <const>[pageRenderResult, pageMetadata];
    const output = { render, metadata };

    for (const { layout } of layouts.toReversed()) {
        const children = output.render;
        logInfo(IC.LayoutRender, Object.getPrototypeOf(layout).constructor.name);
        output.render = await layout.render(children);
        const layoutMetadata = (await layout.metadata?.()) ?? {};
        const options: DeepMergeOptions = { arrayMergeStrategy: "combine" };
        output.metadata = deepMerge.withOptions(options, layoutMetadata, output.metadata);
    }

    const headString = await opts.render.headFn(output.metadata);
    const bodyString = output.render ? await opts.render.jsxRenderFn(output.render) : "";
    const documentCtx: N.DocumentCtx = { ...baseCtx, head: headString, body: bodyString };
    logInfo(IC.DocumentRender, DocumentFn.name);
    const renderResult = await DocumentFn(documentCtx);
    res.headers.set("content-type", "text/html");
    const responseInit: ResponseInit = { headers: res.headers, statusText: res.statusText };
    responseInit.status = res.status;
    if (!pathData.paths.page.default) responseInit.status = c.NOT_FOUND_STATUS;
    if (opts.isNotFound) responseInit.status = c.NOT_FOUND_STATUS;
    if (opts.isError) responseInit.status = c.ERROR_STATUS;
    return new Response(renderResult, responseInit);
}
