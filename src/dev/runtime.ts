import { dirname, fromFileUrl, relative } from "@std/path";

export function readDir(path: string): AsyncIterable<Deno.DirEntry> | undefined {
    try {
        return Deno.readDir(path);
    } catch (_error) {
        return undefined;
    }
}

export async function dirStat(path: string): Promise<Deno.FileInfo | undefined> {
    try {
        return await Deno.stat(path);
    } catch (_error) {
        return undefined;
    }
}

export async function dirExists(path: string): Promise<boolean> {
    return Boolean((await dirStat(path))?.isDirectory);
}

export function serverListen(
    options: Deno.ServeTcpOptions,
    handler: Deno.ServeHandler<Deno.NetAddr>
): Deno.HttpServer<Deno.NetAddr> {
    return Deno.serve(options, handler);
}

// deno-lint-ignore no-explicit-any
export async function relDynImport(path: string): Promise<any> {
    try {
        const fileDir = dirname(fromFileUrl(import.meta.url));
        return await import(relative(fileDir.slice(Deno.cwd().length + 1), path));
    } catch (_error) {
        return undefined;
    }
}
