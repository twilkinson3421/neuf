import type { ServeOptions } from "../serve/index.ts";

const ACCEPTABLE_ERRORS = <const>[Deno.errors.NotFound, Deno.errors.NotADirectory];
const errIsAcceptable = (e: unknown): boolean => ACCEPTABLE_ERRORS.some(a => e instanceof a);

export function readDir(path: string): AsyncIterable<Deno.DirEntry> | undefined {
    try {
        return Deno.readDir(path);
    } catch (error) {
        if (errIsAcceptable(error)) return;
        throw error;
    }
}

export async function dirStat(path: string): Promise<Deno.FileInfo | undefined> {
    try {
        return await Deno.stat(path);
    } catch (error) {
        if (errIsAcceptable(error)) return;
        throw error;
    }
}

export async function dirExists(path: string): Promise<boolean> {
    return Boolean((await dirStat(path))?.isDirectory);
}

export async function importDynamic<T>(
    importFn: ServeOptions["importFn"],
    path: string
): Promise<T | undefined> {
    try {
        return await importFn<T>(path);
    } catch (error) {
        throw error;
    }
}
