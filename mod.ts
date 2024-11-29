/**
 * A simple barebones SSR web framework for Deno. Uses preact JSX for templating.
 * Support for file-based routing, dynamic routes, catch-all routes, and route-groups.
 * Build pages using JSX components, pages, layouts, 'documents', and 'route-handlers'.
 *
 * Basic usage
 * @example
 * ```ts
 * import { listen, serve, router, ROUTER_DEFAULTS, type Lib } from "@neuf/neuf";
 * import { relative, join } from "@std/join";
 * import { render } from "preact-render-to-string";
 *
 * const importFn: Lib.ServeOptions["importFn"] = async path => {
 *     const thisModuleDir = import.meta.dirname!;
 *     const toCwd = relative(thisModuleDir, Deno.cwd());
 *     const fullPath = join(toCwd, path);
 *     return await import(fullPath);
 * };
 *
 * listen({
 *     hostname: "0.0.0.0",
 *     port: 8080,
 *     handler: (req, res, isError) => {
 *         return serve(req, res, {
 *             isError,
 *             isNotFound: false,
 *             staticOptions: { fsRoot: "src/public", quiet: true },
 *             importFn,
 *             router: $req => router($req, ROUTER_DEFAULTS),
 *             renderJSX: render,
 *         });
 *     },
 * });
 * ```
 *
 * @module
 */

export * from "./src/router/index.ts";
export * from "./src/router/defaults.ts";
export * from "./src/serve/index.ts";
export * from "./src/listen/index.ts";
export * from "./src/features/decorators.ts";
export * from "./src/features/control-codes.ts";
export * from "./src/lib/metadata.ts";

export * as Log from "./src/lib/log.ts";
export * as Lib from "./src/lib/types.ts";
