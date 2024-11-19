import * as c from "../dev/constants.ts";
import * as sys from "../dev/runtime.ts";
import type * as N from "../dev/lib.types.ts";
import type * as R from "../dev/router.types.ts";
import type * as S from "../dev/serve.types.ts";

export async function getMiddlewares(importFn: S.ImportFn, path: string): Promise<N.Middleware[]> {
    return Object.values((await sys.tryDynamicImport(importFn, path)) ?? {});
}

export function shouldReturnStatic(pathname: string, res: Response): boolean {
    if (res.status !== c.NOT_FOUND_STATUS) return true;
    if (pathname.includes(".")) return true;
    return false;
}

async function importDocument(importFn: S.ImportFn, path: string): Promise<N.DocumentFn> {
    return <N.DocumentFn>(await sys.tryDynamicImport(importFn, path))?.default;
}

async function importLayouts(importFn: S.ImportFn, paths: string[]): Promise<N.StaticLayout[]> {
    const iFn = async (p: string) =>
        <N.StaticLayout>(await sys.tryDynamicImport(importFn, p)).default;
    return await Promise.all(paths.map(iFn));
}

async function importPage(importFn: S.ImportFn, path?: string): Promise<N.StaticPage | undefined> {
    if (!path) return undefined;
    return <N.StaticPage>(await sys.tryDynamicImport(importFn, path)).default;
}

async function importRouteHandler(
    importFn: S.ImportFn,
    path?: string
): Promise<N.RouteHandlerModule | undefined> {
    if (!path) return undefined;
    return <N.RouteHandlerModule>await sys.tryDynamicImport(importFn, path);
}

export async function getStaticImports(
    importFn: S.ImportFn,
    pathData: R.PathData,
    isError: boolean
): Promise<S.StaticImports> {
    return <const>[
        await importDocument(importFn, pathData.paths.document),
        await importLayouts(importFn, pathData.paths.layouts),
        await importPage(
            importFn,
            isError
                ? pathData.paths.page.error
                : pathData.paths.page.default ?? pathData.paths.page.notFound
        ),
        await importRouteHandler(importFn, pathData.paths.routeHandler),
    ];
}

export function validateRouteHandlerMethod(method: string): method is N.ValidRouteHandlerMethod {
    return c.VALID_ROUTE_HANDLER_METHODS.some(m => m === method);
}

export function initLayouts(): S.LayoutObject[] {
    return [];
}
