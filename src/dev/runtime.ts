import { dirname, fromFileUrl, relative } from "@std/path";

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
 * Performs a dynamic import of a module, relative to the current file path.
 * @param path The path to the module to import.
 * @returns A promise containing the module, or undefined if the module does not exist.
 * The type of the module should be explicitly specified.
 */
// deno-lint-ignore no-explicit-any
export async function relDynImport(path: string): Promise<any> {
    try {
        const fileDir = dirname(fromFileUrl(import.meta.url));
        const relativePath = `${relative(fileDir, Deno.cwd())}/${path}`;
        if (Deno.env.get("NEUF_IMPORT_DEBUG")) console.log(fileDir, Deno.cwd(), path, relativePath);
        return await import(relativePath);
    } catch (_error) {
        return undefined;
    }
}
