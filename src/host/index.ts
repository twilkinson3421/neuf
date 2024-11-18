import * as sys from "../dev/runtime.ts";
import type * as H from "../dev/host.types.ts";
export type * from "../dev/host.types.ts";

export function host(opts: H.HostOptions): void {
    let $req: Request;
    const res = new Response();
    const memreq = (req: Request) => true && ($req = req) && $req;

    const handler: H.Handler = async req => await opts.serve(memreq(req), res, false);
    const onError: H.ErrorHandler = async _err => await opts.serve($req, res, true);

    const tcpOptions: H.Options = {};
    tcpOptions.port = opts.network.port;
    tcpOptions.hostname = opts.network.hostname;
    tcpOptions.onError = onError;

    sys.serverListen(tcpOptions, handler);
}
