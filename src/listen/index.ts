import { HEADER } from "@std/http/unstable-header";
import { INFO_CODE, log } from "../lib/log.ts";

export interface ListenOptions {
    hostname: string;
    port: number;
    handler: (req: Request, res: Response, isError: boolean) => Response | Promise<Response>;
}

type Handler = Deno.ServeHandler<Deno.NetAddr>;
type ErrorHandler = Deno.ServeTcpOptions["onError"];
type ListenHandler = Deno.ServeTcpOptions["onListen"];

export function listen(opts: ListenOptions): void {
    let request: Request;
    const memReq = (req: Request) => (request = req) && request;
    const response = new Response();
    let responseStartTime = 0;

    const handler: Handler = async req => {
        responseStartTime = Date.now();
        response.headers.set(HEADER.Date, new Date(responseStartTime).toUTCString());
        const IS_ERROR = <const>false;
        const handlerResponse = await opts.handler(memReq(req), response, IS_ERROR);
        log.response(request, response.status, responseStartTime);
        return handlerResponse;
    };

    const onError: ErrorHandler = async err => {
        console.error(err instanceof Error ? err.stack : err);
        const IS_ERROR = <const>true;
        const handlerResponse = await opts.handler(request, response, IS_ERROR);
        log.response(request, response.status, responseStartTime);
        return handlerResponse;
    };

    const onListen: ListenHandler = addr => {
        const loc = `${addr.hostname}:${addr.port} (${addr.transport})`;
        log.info(INFO_CODE.ServerListening, loc);
    };

    const tcpOpts: Deno.ServeTcpOptions = {};
    tcpOpts.port = opts.port;
    tcpOpts.hostname = opts.hostname;
    tcpOpts.onError = onError;
    tcpOpts.onListen = onListen;

    Deno.serve(tcpOpts, handler);
}
