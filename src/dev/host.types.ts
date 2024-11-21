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

/** @alias Deno.ServeHandler<Deno.NetAddr> */
export type Handler = Deno.ServeHandler<Deno.NetAddr>;
export type Options = Deno.ServeTcpOptions;

/** A version of the handler which is called when an uncaught error is thrown in the serve function. */
export type ErrorHandler = Options["onError"];

/** A function which is called when the server starts listening for requests. */
export type ListenHandler = Options["onListen"];
