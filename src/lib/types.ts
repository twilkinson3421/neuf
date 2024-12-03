/**
 * Provides types for building a Neuf application.
 *
 * @module
 */

import type { ControlCode } from "../features/control-codes.ts";
import type { JSX } from "preact";
import type { Method } from "@std/http/unstable-method";

export type ExtResult = Response | ControlCode | void;

export interface Metadata {
    title?: string;
    base?: JSX.HTMLAttributes<HTMLBaseElement>;
    meta?: JSX.MetaHTMLAttributes<HTMLMetaElement>[];
    links?: JSX.HTMLAttributes<HTMLLinkElement>[];
    scripts?: JSX.HTMLAttributes<HTMLScriptElement>[];
    styles?: JSX.HTMLAttributes<HTMLStyleElement>[];
}

export interface BaseCtx<P = unknown> {
    req: Request;
    res: Response;
    pathname: string;
    urlParams: P;
    urlSearchParams: URLSearchParams;
}

export interface DocumentCtx<P = unknown> extends BaseCtx<P> {
    head: string;
    body: string;
}

export interface LayoutClassCtx<P = unknown, U = unknown> extends BaseCtx<P> {
    upstream: U;
}

export interface LayoutCtx<P = unknown, D = unknown, U = unknown> extends LayoutClassCtx<P, U> {
    downstream: D;
}

export interface RouteHandlerCtx<P = unknown> extends BaseCtx<P> {}

export interface PageClassCtx<P = unknown> extends BaseCtx<P> {}

export interface PageCtx<P = unknown, D = unknown> extends PageClassCtx<P> {
    downstream: D;
}

export type Document<P = unknown> = (ctx: DocumentCtx<P>) => string | Promise<string>;

export interface LayoutClass {
    new (ctx: LayoutCtx): Layout;
    upstream?(ctx: LayoutClassCtx): unknown;
}

export interface Layout {
    render(children: JSX.Element): JSX.Element | Promise<JSX.Element>;
    metadata?(): Metadata | Promise<Metadata>;
    downstream?(): unknown;
    init?(): ExtResult | Promise<ExtResult>;
}

export type RouteHandler<P = unknown> = (
    ctx: RouteHandlerCtx<P>
) => Response | void | Promise<Response | void>;

export type RouteHandlerModule = Partial<Record<Method, RouteHandler>>;

export interface PageConfig {
    disinheritLayout?: boolean;
}

export interface PageClass {
    new (ctx: PageCtx): Page;
    upstream?(ctx: PageClassCtx): unknown;
    config?(ctx: PageClassCtx): PageConfig | Promise<PageConfig>;
}

export interface Page {
    render(): JSX.Element | Promise<JSX.Element>;
    metadata?(): Metadata | Promise<Metadata>;
    init?(): ExtResult | Promise<ExtResult>;
}
