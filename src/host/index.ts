import * as sys from "../dev/runtime.ts";
import type * as H from "../dev/host.types.ts";
export type * from "../dev/host.types.ts";

import { Logger, ERROR_CODE as EC, INFO_CODE as IC } from "../dev/log.ts";

const genLogRes = (req: Request) => Logger.genLogNotSelf(req, Logger.response);
const genLogInfo = (req: Request) => Logger.genLogNotSelf(req, Logger.info);
const genLogErr = (req: Request) => Logger.genLogNotSelf(req, Logger.error);

/**
 * Starts a server listening at the specified address and port.
 * @param opts Configuration options for the server.
 */
export function host(opts: H.HostOptions): void {
    let $req: Request;
    const res = new Response();
    const memreq = (req: Request) => true && ($req = req) && $req;

    const handler: H.Handler = async req => {
        genLogInfo(req)(IC.RequestReceived, new URL(req.url).pathname);
        const response = await opts.serve(memreq(req), res, false);
        genLogRes($req)($req, response.status);
        return response;
    };

    const onError: H.ErrorHandler = async _err => {
        genLogErr($req)(EC.ErrorHandlerCalled);
        const response = await opts.serve($req, res, true);
        genLogRes($req)($req, response.status);
        return response;
    };

    const onListen: H.ListenHandler = addr =>
        Logger.info(IC.ServerListening, `${addr.hostname}:${addr.port} (${addr.transport})`);

    const tcpOptions: H.Options = {};
    tcpOptions.port = opts.network.port;
    tcpOptions.hostname = opts.network.hostname;
    tcpOptions.onError = onError;
    tcpOptions.onListen = onListen;

    sys.serverListen(tcpOptions, handler);
}
