/**
 * Contains the {@linkcode listen} function which starts a server.
 * Provide a {@linkcode ListenOptions} object to configure the server.
 *
 * @example
 * ```ts
 * import { listen, serve, router, type ServeOptions } from "@neuf/neuf";
 * import { relative, join } from "@std/join";
 * import { render } from "preact-render-to-string";
 *
 * const importFn: ServeOptions["importFn"] = async path => {
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
 *             router,
 *             renderJSX: render,
 *         });
 *     },
 * });
 * ```
 *
 * @module
 */

import { INFO_CODE, Log } from "../lib/log.ts";

export interface ListenOptions {
    hostname: string;
    port: number;
    handler: (req: Request, isError: boolean) => Response | Promise<Response>;
}

type Handler = Deno.ServeHandler<Deno.NetAddr>;
type ErrorHandler = Deno.ServeTcpOptions["onError"];
type ListenHandler = Deno.ServeTcpOptions["onListen"];

export function listen(opts: ListenOptions): void {
    let request: Request;
    const memReq = (req: Request) => (request = req) && request;
    let responseStartTime: number;

    const handler: Handler = async req => {
        responseStartTime = Date.now();
        const IS_ERROR = <const>false;
        const response = await opts.handler(memReq(req), IS_ERROR);
        Log.response(request, response.status, responseStartTime);
        return response;
    };

    const onError: ErrorHandler = async err => {
        console.error(err instanceof Error ? err.stack : err);
        const IS_ERROR = <const>true;
        const response = await opts.handler(request, IS_ERROR);
        Log.response(request, response.status, responseStartTime);
        return response;
    };

    const onListen: ListenHandler = addr => {
        const loc = `${addr.hostname}:${addr.port} (${addr.transport})`;
        Log.info(INFO_CODE.ServerListening, loc);
    };

    const tcpOpts: Deno.ServeTcpOptions = {};
    tcpOpts.port = opts.port;
    tcpOpts.hostname = opts.hostname;
    tcpOpts.onError = onError;
    tcpOpts.onListen = onListen;

    Deno.serve(tcpOpts, handler);
}
