import type * as S from "./serve.types.ts";

/**
 * Reads the contents of a directory.
 * @param path The path to the directory from the current working directory.
 * @returns An async iterable of directory entries, or undefined if the directory does not exist.
 */
export function readDir(path: string): AsyncIterable<Deno.DirEntry> | undefined {
    try {
        return Deno.readDir(path);
    } catch (_error) {
        return undefined;
    }
}

/**
 * Provides information about a directory.
 * @param path The path to the directory from the current working directory.
 * @returns A promise containing the information, or undefined if the directory does not exist.
 */
export async function dirStat(path: string): Promise<Deno.FileInfo | undefined> {
    try {
        return await Deno.stat(path);
    } catch (_error) {
        return undefined;
    }
}

/**
 * Determines whether a directory exists.
 * @param path The path to the directory from the current working directory.
 * @returns A promise which resolves to true if the directory exists, or false if it does not.
 */
export async function dirExists(path: string): Promise<boolean> {
    return Boolean((await dirStat(path))?.isDirectory);
}

/**
 * Starts a server listening at the specified address and port.
 * @param options Configuration options for the server.
 * @param handler A handler for HTTP requests.
 * @returns An HTTP server.
 */
export function serverListen(
    options: Deno.ServeTcpOptions,
    handler: Deno.ServeHandler<Deno.NetAddr>
): Deno.HttpServer<Deno.NetAddr> {
    return Deno.serve(options, handler);
}

/**
 * Attempt to dynamically import a module at a given path.
 * @param importFn The import function to use.
 * @param path The path to the module to import.
 * @returns A promise which resolves to the imported module, or `undefined` if the import failed.
 */
export async function tryDynamicImport(
    importFn: S.ImportFn,
    path: string
): Promise<ReturnType<S.ImportFn> | undefined> {
    try {
        return await importFn(path);
    } catch (_error) {
        return undefined;
    }
}
