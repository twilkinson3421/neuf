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
import { List } from "@exts/list";

export interface ListenOptions {
    hostname: string;
    port: number;
    handler: (req: Request, isError: boolean) => Response | Promise<Response>;
}

type Handler = Deno.ServeHandler<Deno.NetAddr>;
type ErrorHandler = Deno.ServeTcpOptions["onError"];
type ListenHandler = Deno.ServeTcpOptions["onListen"];

interface RequestStackEntry {
    request: Request;
    startTime: number;
}

export function listen(opts: ListenOptions): void {
    const requestStack: List<RequestStackEntry> = new List();

    const handler: Handler = async req => {
        const savedReq = requestStack.push({ request: req, startTime: Date.now() }).last!;
        const IS_ERROR = <const>false;
        const response = await opts.handler(req, IS_ERROR);
        Log.response(savedReq.value.request, response.status, savedReq.value.startTime);
        savedReq.extractOffset(0);
        return response;
    };

    const onError: ErrorHandler = async err => {
        const savedReq = requestStack.pop()?.value;
        if (!savedReq) throw new Error(`Request stack is empty. This is a bug in the Neuf server.`);
        console.error(err instanceof Error ? err.stack : err);
        const IS_ERROR = <const>true;
        const response = await opts.handler(savedReq.request, IS_ERROR);
        Log.response(savedReq.request, response.status, savedReq.startTime);
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
