import * as c from "../dev/constants.ts";
import * as h from "./helpers.ts";
import type * as N from "../dev/lib.types.ts";
import type * as S from "../dev/serve.types.ts";
export type * from "../dev/serve.types.ts";

import { serveDir } from "@std/http/file-server";
import { deepMerge, type DeepMergeOptions } from "@cross/deepmerge";

/**
 * Serves a request.
 * @param req The request object.
 * @param res The response object.
 * @param opts Configuration options for serving a Neuf application.
 * @returns A promise which resolves to a response.
 */
export async function serve(req: Request, res: Response, opts: S.ServeOptions): Promise<Response> {
    const pathname = new URL(req.url).pathname;

    const middlewares = await h.getMiddlewares(opts.middleware);
    for (const middleware of middlewares) {
        if (middleware.options?.matcher && !middleware.options.matcher.test(pathname)) continue;
        const result = await middleware.handler(req, res);
        if (result instanceof Response) return result;
    }

    const staticResponse = await serveDir(req, opts.serveStaticOptions);
    if (h.shouldReturnStatic(pathname, staticResponse)) return staticResponse;

    const pathData = await opts.router(req);
    const [DocumentFn, LayoutClasses, PageClass] = await h.getStaticImports(pathData, opts.isError);
    if (!PageClass) return opts.isError ? c.ERROR_RESPONSE : c.NOT_FOUND_RESPONSE;

    const { params, searchParams } = pathData.url;
    const baseCtx: N.BaseCtx = { req, res, pathname, params, searchParams };
    const staticPageCtx: N.StaticPageCtx = baseCtx;
    const pageOptions = await PageClass.options?.(staticPageCtx);
    if (pageOptions?.ignoreLayout) LayoutClasses.length = 0;

    const upstreamArr: N.Upstream[] = [];
    upstreamArr.push((await PageClass.upstream?.(staticPageCtx)) ?? {});
    const getPreviousUpstream = (): N.Upstream => upstreamArr.at(-1) ?? {};

    for await (const LayoutClass of LayoutClasses.toReversed()) {
        const previousUpstream = getPreviousUpstream();
        const staticLayoutCtx: N.StaticLayoutCtx = { ...baseCtx, upstream: previousUpstream };
        const middlewareResult = await LayoutClass.middleware?.(staticLayoutCtx);
        if (middlewareResult instanceof Response) return middlewareResult;
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
        if (responseResult instanceof Response) return responseResult;
        const downstream = (await layoutInstance.downstream?.()) ?? {};
        const mergedDownstream = deepMerge(previousDownstream, downstream);
        layouts.push({ layout: layoutInstance, downstream: mergedDownstream });
    }

    const pageCtx: N.PageCtx = { ...baseCtx, downstream: getPreviousDownstream() };
    const middlewareResult = await PageClass.middleware?.(pageCtx);
    if (middlewareResult instanceof Response) return middlewareResult;
    const pageInstance = new PageClass(pageCtx);
    await pageInstance.init?.();
    const responseResult = await pageInstance.response?.();
    if (responseResult instanceof Response) return responseResult;
    const pageRenderResult = await pageInstance.render();
    const pageMetadata = (await pageInstance.metadata?.()) ?? {};
    const [render, metadata] = <const>[pageRenderResult, pageMetadata];
    const output = { render, metadata };

    for (const { layout } of layouts.toReversed()) {
        const children = output.render;
        output.render = await layout.render(children);
        const layoutMetadata = (await layout.metadata?.()) ?? {};
        const options: DeepMergeOptions = { arrayMergeStrategy: "combine" };
        output.metadata = deepMerge.withOptions(options, layoutMetadata, output.metadata);
    }

    const headString = await opts.render.headFn(output.metadata);
    const bodyString = output.render ? await opts.render.jsxRenderFn(output.render) : "";
    const documentCtx: N.DocumentCtx = { ...baseCtx, head: headString, body: bodyString };
    const renderResult = await DocumentFn(documentCtx);
    res.headers.set("content-type", "text/html");
    const responseInit: ResponseInit = { headers: res.headers, statusText: res.statusText };
    responseInit.status = pathData.paths.page.default ? res.status : c.NOT_FOUND_STATUS;
    if (opts.isError) responseInit.status = c.ERROR_STATUS;
    return new Response(renderResult, responseInit);
}
