import type * as N from "./lib.types.ts";
import type * as R from "./router.types.ts";

import type { ServeDirOptions } from "@std/http/file-server";
import type { VNode } from "preact";

export type Serve = (req: Request, res: Response, isError: boolean) => Promise<Response> | Response;

export interface ServeOptions {
    isError: boolean;
    middleware: string;
    router: R.Router;
    serveStaticOptions: ServeDirOptions;
    render: {
        headFn: HeadFn;
        jsxRenderFn: JsxRenderFn;
    };
}

export type StaticImports = readonly [N.DocumentFn, N.StaticLayout[], N.StaticPage | undefined];

export type HeadFn = (metadata: N.Metadata) => Promise<string> | string;
// deno-lint-ignore no-explicit-any ban-types
export type JsxRenderFn<P = {}> = (vnode: VNode<P>, context?: any) => Promise<string> | string;

export interface LayoutObject {
    layout: N.Layout;
    downstream: N.Downstream;
}
