import type * as N from "./lib.types.ts";
import type * as R from "./router.types.ts";

import type { ServeDirOptions } from "@std/http/file-server";
import type { VNode } from "preact";

/**
 * A function which provides a response to a request.
 * @param req The request object.
 * @param res The response object.
 * @param isError Whether the request should be handled as an error.
 */
export type Serve = (req: Request, res: Response, isError: boolean) => Promise<Response> | Response;

/** Configuration options for serving a Neuf application. */
export interface ServeOptions {
    /** Whether the request should be handled as an error. */
    isError: boolean;
    /** The path to the file where middleware might be defined; this file does not have to exist. */
    middleware: string;
    /** A function which takes a path (from cwd) and asynchronously imports the module at that path. */
    importFn: ImportFn;
    /** A function which takes a request and returns a `PathData` object. */
    router: R.Router;
    /** Options for serving static files. */
    serveStaticOptions: ServeDirOptions;
    render: {
        /** The function used to generate the HTML string for the head element from metadata. Can be async. */
        headFn: HeadFn;
        /** The function used to render JSX elements to HTML strings. Can be async. */
        jsxRenderFn: JsxRenderFn;
    };
}

export type StaticImports = readonly [N.DocumentFn, N.StaticLayout[], N.StaticPage | undefined];

/** A function used to generate the HTML string for the head element from metadata. */
export type HeadFn = (metadata: N.Metadata) => Promise<string> | string;
/** A function used to render JSX elements to HTML strings. */
// deno-lint-ignore no-explicit-any ban-types
export type JsxRenderFn<P = {}> = (vnode: VNode<P>, context?: any) => Promise<string> | string;

export interface LayoutObject {
    layout: N.Layout;
    downstream: N.Downstream;
}

// deno-lint-ignore no-explicit-any
export type ImportFn = (path: string) => Promise<any>;
