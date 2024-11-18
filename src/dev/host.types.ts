import type * as S from "./serve.types.ts";

export interface HostOptions {
    network: {
        port: number;
        hostname: string;
    };
    serve: S.Serve;
}

export type Handler = Deno.ServeHandler<Deno.NetAddr>;
export type Options = Deno.ServeTcpOptions;
export type ErrorHandler = Options["onError"];
