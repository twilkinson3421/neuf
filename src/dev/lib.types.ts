export * as Host from "./host.types.ts";
export * as Router from "./router.types.ts";
export * as Serve from "./serve.types.ts";

import type { Control } from "../serve/control.ts";
import type { VALID_ROUTE_HANDLER_METHODS } from "./constants.ts";

/** A valid JSX element. */
type JSXELement = preact.JSX.Element | null;

/** A possible response in special Neuf functions, such as middleware. */
export type PossibleNeufResponse = Response | Control | void;

/** A middleware object. */
export interface Middleware {
    /**
     * The function called when the middleware is invoked.
     * If anything but a response object is returned, the next middleware is invoked, if one exists.
     * @param req The request object.
     * @param res The response object.
     * @returns Nothing, or a response which is immediately returned to the client. Can be async.
     */
    handler(req: Request, res: Response): Promise<Response | void> | Response | void;
    /** Options for configuring this middleware. */
    options?: MiddlewareOptions;
}

/** Options for configuring a middleware. */
export interface MiddlewareOptions {
    /**
     * A regular expression used to match the request path.
     * If the path does not match, the middleware is not invoked.
     */
    matcher?: RegExp;
}

/** A record containing dynamic URL parameters. */
export type Params<T extends Record<string, unknown> = Record<string, unknown>> = T;
/** A record data sent downstream from inherited layouts. */
export type Downstream<T extends Record<string, unknown> = Record<string, unknown>> = T;
/** A record data sent upstream from inheriting layouts, or pages. */
export type Upstream<T extends Record<string, unknown> = Record<string, unknown>> = T;

/** A basic context object. */
export interface BaseCtx<P extends Params = Params> {
    /** The request object. */
    req: Request;
    /** The response object. */
    res: Response;
    /** The pathname of the request. */
    pathname: string;
    /** The dynamic URL parameters. */
    params: P;
    /** The URL search parameters. */
    searchParams: URLSearchParams;
}

/** A context object passed to the document function. */
export interface DocumentCtx<P extends Params = Params> extends BaseCtx<P> {
    /** The HTML string for the head element. */
    head: string;
    /** The HTML string for the body element. */
    body: string;
}

/** A context object passed to a layout. */
export interface LayoutCtx<
    P extends Params = Params,
    D extends Downstream = Downstream,
    U extends Upstream = Upstream
> extends BaseCtx<P> {
    /** The data sent downstream from inherited layouts. */
    downstream: D;
    /** The data sent upstream from inheriting layouts, or pages. */
    upstream: U;
}

/**
 * A context object passed to static methods of a layout.
 * Similar to `LayoutCtx`, but without the `downstream` property.
 */
export interface StaticLayoutCtx<P extends Params = Params, U extends Upstream = Upstream>
    extends Omit<LayoutCtx<P, Downstream, U>, "downstream"> {}

/** A context object passed to a page. */
export interface PageCtx<P extends Params = Params, D extends Downstream = Downstream>
    extends BaseCtx<P> {
    /** The data sent downstream from inherited layouts. */
    downstream: D;
}

/**
 * A context object passed to static methods of a page.
 * Similar to `PageCtx`, but without the `downstream` property.
 */
export interface StaticPageCtx<P extends Params = Params> extends Omit<PageCtx<P>, "downstream"> {}

/** Metadata which is used to generate the head element. */
export interface Metadata {
    /** Options for the base element. */
    base?: preact.JSX.HTMLAttributes<HTMLBaseElement>;
    /** The title of the page. */
    title?: string;
    /** An array of JSX attribute objects for meta elements. */
    meta?: Array<preact.JSX.HTMLAttributes<HTMLMetaElement>>;
    /** An array of JSX attribute objects for link elements. */
    links?: Array<preact.JSX.HTMLAttributes<HTMLLinkElement>>;
    /** An array of JSX attribute objects for script elements. */
    scripts?: Array<preact.JSX.HTMLAttributes<HTMLLinkElement>>;
    /** An array of JSX attribute objects for style elements. */
    style?: Array<preact.JSX.HTMLAttributes<HTMLStyleElement>>;
}

/** A function which creates the HTML text for the response body. */
export type DocumentFn<P extends Params = Params> = (
    /** The context object. */
    ctx: DocumentCtx<P>
) => Promise<string> | string;

/** A Neuf layout. */
export interface Layout {
    /**
     * A method which renders the layout.
     * @param children The children of the layout.
     * @returns A JSX element. Can be async.
     */
    render(children: JSXELement): Promise<JSXELement> | JSXELement;
    /**
     * A method which can be used to declare metadata.
     * @returns `Metadata`. Can be async.
     */
    metadata?(): Promise<Metadata> | Metadata;
    /**
     * A method which can be used to send data downstream, to inheriting layouts and pages.
     * @returns `Downstream`. Can be async.
     */
    downstream?(): Promise<Downstream> | Downstream;
    /**
     * A method which is called after the layout is instantiated.
     * @returns Nothing. Can be async.
     */
    init?(): Promise<void> | void;
    /**
     * A method which can be used to return a custom HTTP response.
     * If anything but a response object is returned, nothing happens.
     * @returns A response object, control code, or nothing. Can be async.
     */
    response?(): Promise<PossibleNeufResponse> | PossibleNeufResponse;
}

/** A static Neuf layout (class). */
export interface StaticLayout {
    /**
     * A constructor for the layout.
     * @param ctx The context object.
     * @returns An instantiated layout object.
     */
    new (ctx: LayoutCtx): Layout;
    /**
     * A method which can be used to send data upstream, to inherited layouts.
     * @param ctx The static layout context object.
     * @returns `Upstream`. Can be async.
     */
    upstream?(ctx: StaticLayoutCtx): Promise<Upstream> | Upstream;
    /**
     * A method which can be used to return a custom HTTP response.
     * If anything but a response object is returned, nothing happens.
     * @param ctx The static layout context object.
     * @returns A response object, control code, or nothing. Can be async.
     */
    middleware?(ctx: StaticLayoutCtx): Promise<PossibleNeufResponse> | PossibleNeufResponse;
}

/** A Neuf page. */
export interface Page {
    /**
     * A method which renders the page.
     * @returns A JSX element. Can be async.
     */
    render(): Promise<JSXELement> | JSXELement;
    /**
     * A method which can be used to return a custom HTTP response.
     * If anything but a response object is returned, nothing happens.
     * @returns A response object, or nothing. Can be async.
     */
    metadata?(): Promise<Metadata> | Metadata;
    /**
     * A method which is called after the page is instantiated.
     * @returns Nothing. Can be async.
     */
    init?(): Promise<void> | void;
    /**
     * A method which can be used to return a custom HTTP response.
     * If anything but a response object is returned, nothing happens.
     * @returns A response object, control code, or nothing. Can be async.
     */
    response?(): Promise<PossibleNeufResponse> | PossibleNeufResponse;
}

/** A static Neuf page (class). */
export interface StaticPage {
    /**
     * A constructor for the page.
     * @param ctx The context object.
     * @returns An instantiated page object.
     */
    new (ctx: PageCtx): Page;
    /**
     * A method which can be used to send data upstream, to inherited layouts.
     * @param ctx The static page context object.
     * @returns `Upstream`. Can be async.
     */
    upstream?(ctx: StaticPageCtx): Promise<Upstream> | Upstream;
    /**
     * A method which can be used to return a custom HTTP response.
     * If anything but a response object is returned, nothing happens.
     * @param ctx The static page context object.
     * @returns A response object, control code, or nothing. Can be async.
     */
    middleware?(ctx: StaticPageCtx): Promise<PossibleNeufResponse> | PossibleNeufResponse;
    /**
     * A method which can be used to configure the behavior of the page.
     * @param ctx The static page context object.
     * @returns `PageOptions`. Can be async.
     */
    options?(ctx: StaticPageCtx): Promise<PageOptions> | PageOptions;
}

/** Options for configuring the behavior of a page. */
export interface PageOptions {
    /** Don't inherit layouts. */
    ignoreLayout?: boolean;
}

/** A context object passed to a route handler. */
export interface RouteHandlerCtx<P extends Params = Params> extends BaseCtx<P> {}

/** A primitive function which can be used to handle a request. */
export type RouteHandler<P extends Params = Params> = (
    ctx: RouteHandlerCtx<P>
) => Promise<Response | void> | Response | void;

/** A valid route handler request method. */
export type ValidRouteHandlerMethod = (typeof VALID_ROUTE_HANDLER_METHODS)[number];

export type RouteHandlerModule = Partial<Record<ValidRouteHandlerMethod, RouteHandler>>;
