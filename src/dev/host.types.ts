import type * as S from "./serve.types.ts";

/** Configuration options for hosting a Neuf application. */
export interface HostOptions {
    network: {
        /** The port to listen on */
        port: number;
        /** The hostname to listen on */
        hostname: string;
    };
    /** A function which provides a response to a request */
    serve: S.Serve;
}

/** A handler for HTTP requests.
 * @param request The request object.
 * @param info The request info object (Deno).
 * @returns A synchronous response or a promise which resolves to a response.
 */
export type Handler = Deno.ServeHandler<Deno.NetAddr>;
export type Options = Deno.ServeTcpOptions;
/** A version of the handler which is called when an uncaught error is thrown in the serve function.
 * @param error The error thrown.
 * @returns A promise which resolves to a response, or nothing. Can be async.
 */
export type ErrorHandler = Options["onError"];
