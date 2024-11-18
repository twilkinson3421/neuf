import * as c from "../dev/constants.ts";
import * as sys from "../dev/runtime.ts";
import type * as N from "../dev/lib.types.ts";
import type * as R from "../dev/router.types.ts";
import type * as S from "../dev/serve.types.ts";

export async function getMiddlewares(path: string): Promise<N.Middleware[]> {
    return Object.values((await sys.relDynImport(path)) ?? {});
}

export function shouldReturnStatic(pathname: string, res: Response): boolean {
    if (res.status !== c.NOT_FOUND_STATUS) return true;
    if (pathname.includes(".")) return true;
    return false;
}

async function importDocument(path: string): Promise<N.DocumentFn> {
    return (await sys.relDynImport(path)).default as N.DocumentFn;
}

async function importLayouts(paths: string[]): Promise<N.StaticLayout[]> {
    const iFn = async (path: string) => (await sys.relDynImport(path)).default as N.StaticLayout;
    return await Promise.all(paths.map(iFn));
}

async function importPage(path?: string): Promise<N.StaticPage | undefined> {
    if (!path) return undefined;
    return (await sys.relDynImport(path)).default as N.StaticPage;
}

export async function getStaticImports(
    pathData: R.PathData,
    isError: boolean
): Promise<S.StaticImports> {
    return <const>[
        await importDocument(pathData.paths.document),
        await importLayouts(pathData.paths.layouts),
        await importPage(
            isError
                ? pathData.paths.page.error
                : pathData.paths.page.default ?? pathData.paths.page.notFound
        ),
    ];
}

export function initLayouts(): S.LayoutObject[] {
    return [];
}
