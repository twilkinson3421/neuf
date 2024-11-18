export * as Host from "./host.types.ts";
export * as Router from "./router.types.ts";
export * as Serve from "./serve.types.ts";

type JSXELement = preact.JSX.Element | null;

export interface Middleware {
    handler(req: Request, res: Response): Promise<Response | void> | Response | void;
    options?: MiddlewareOptions;
}

export interface MiddlewareOptions {
    matcher?: RegExp;
}

export type Params<T extends Record<string, unknown> = Record<string, unknown>> = T;
export type Downstream<T extends Record<string, unknown> = Record<string, unknown>> = T;
export type Upstream<T extends Record<string, unknown> = Record<string, unknown>> = T;

export interface BaseCtx<P extends Params = Params> {
    req: Request;
    res: Response;
    pathname: string;
    params: P;
    searchParams: URLSearchParams;
}

export interface DocumentCtx<P extends Params = Params> extends BaseCtx<P> {
    head: string;
    body: string;
}

export interface LayoutCtx<
    P extends Params = Params,
    D extends Downstream = Downstream,
    U extends Upstream = Upstream
> extends BaseCtx<P> {
    downstream: D;
    upstream: U;
}

export interface StaticLayoutCtx<P extends Params = Params, U extends Upstream = Upstream>
    extends Omit<LayoutCtx<P, Downstream, U>, "downstream"> {}

export interface PageCtx<P extends Params = Params, D extends Downstream = Downstream>
    extends BaseCtx<P> {
    downstream: D;
}

export interface StaticPageCtx<P extends Params = Params> extends Omit<PageCtx<P>, "downstream"> {}

export interface Metadata {
    base?: preact.JSX.HTMLAttributes<HTMLBaseElement>;
    title?: string;
    meta?: Array<preact.JSX.HTMLAttributes<HTMLMetaElement>>;
    links?: Array<preact.JSX.HTMLAttributes<HTMLLinkElement>>;
    scripts?: Array<preact.JSX.HTMLAttributes<HTMLLinkElement>>;
    style?: Array<preact.JSX.HTMLAttributes<HTMLStyleElement>>;
}

export type DocumentFn<P extends Params = Params> = (
    ctx: DocumentCtx<P>
) => Promise<string> | string;

export interface Layout {
    render(children: JSXELement): Promise<JSXELement> | JSXELement;
    metadata?(): Promise<Metadata> | Metadata;
    downstream?(): Promise<Downstream> | Downstream;
    init?(): Promise<void> | void;
    response?(): Promise<Response | void> | Response | void;
}

export interface StaticLayout {
    new (ctx: LayoutCtx): Layout;
    upstream?(ctx: StaticLayoutCtx): Promise<Upstream> | Upstream;
    middleware?(ctx: StaticLayoutCtx): Promise<Response | void> | Response | void;
}

export interface Page {
    render(): Promise<JSXELement> | JSXELement;
    metadata?(): Promise<Metadata> | Metadata;
    init?(): Promise<void> | void;
    response?(): Promise<Response | void> | Response | void;
}

export interface StaticPage {
    new (ctx: PageCtx): Page;
    upstream?(ctx: StaticPageCtx): Promise<Upstream> | Upstream;
    middleware?(ctx: StaticPageCtx): Promise<Response | void> | Response | void;
    options?(ctx: StaticPageCtx): Promise<PageOptions> | PageOptions;
}

export interface PageOptions {
    ignoreLayout?: boolean;
}
