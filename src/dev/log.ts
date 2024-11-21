import * as f from "@hikyu/colors";
import * as s from "@std/http/status";

const envHasLogNoRender = () => !!Deno.env.get("NEUF_LOG_NO_RENDER");
const envHasLogSelf = () => !!Deno.env.get("NEUF_LOG_SELF");
const envHasNewline = () => !Deno.env.get("NEUF_LOG_NO_NEWLINE");
const envIsDev = () => !Deno.env.get("NEUF_LOG_PROD");
const envIsProd = () => !!Deno.env.get("NEUF_LOG_PROD");

export class Logger {
    private static get timestamp(): string {
        return new Date().toISOString();
    }

    private static statusColor(status: number): string {
        if (s.isSuccessfulStatus(status)) return f.green(status.toString());
        if (s.isInformationalStatus(status)) return f.blue(status.toString());
        if (s.isRedirectStatus(status)) return f.magenta(status.toString());
        if (s.isErrorStatus(status)) return f.red(status.toString());
        return status.toString();
    }

    private static masks = <const>{
        base: 0b00000000,
        newLine: 0b00000001,
        noLogInProd: 0b00000010,
        noLogInDev: 0b00000100,
        isRenderLog: 0b00001000,
    };

    private static CodifyCode(code: number): number {
        const m = Logger.masks;
        let acc: number = m.base;
        const asArr = code.toString().split("").map(Number);
        const [_1, _2] = asArr.toReversed().map(n => n ?? 0);
        if (_1 === 1) acc += m.newLine;
        if (_2 > 5) acc += _2 < 9 ? m.noLogInProd : m.noLogInDev;
        if (code >= INFO_CODE.DocumentRender && code <= INFO_CODE.PageRender) acc += m.isRenderLog;
        return acc;
    }

    public static response(req: Request, status: number): true {
        const coloredMethod = f.blue(req.method);
        const coloredStatus = Logger.statusColor(status);
        const pathname = new URL(req.url).pathname;
        console.info(`[${Logger.timestamp}] ${coloredMethod} ${coloredStatus} ${pathname}`);
        return true;
    }

    public static info(code: InfoCode, msg?: string): true {
        const codifiedCode = Logger.CodifyCode(code);
        if (codifiedCode & Logger.masks.noLogInProd && envIsProd()) return true;
        if (codifiedCode & Logger.masks.noLogInDev && envIsDev()) return true;
        if (codifiedCode & Logger.masks.isRenderLog && envHasLogNoRender()) return true;
        if (codifiedCode & Logger.masks.newLine && envHasNewline()) console.log();
        const time = `[${Logger.timestamp}]`;
        const info = f.blue(`I${code} ${INFO_TEXT[code]}`);
        console.info(`${time} ${info} ${msg ?? ""}`);
        return true;
    }

    public static warn(code: WarnCode): true {
        const codifiedCode = Logger.CodifyCode(code);
        if (codifiedCode & Logger.masks.noLogInProd && envIsProd()) return true;
        if (codifiedCode & Logger.masks.noLogInDev && envIsDev()) return true;
        if (codifiedCode & Logger.masks.isRenderLog && envHasLogNoRender()) return true;
        if (codifiedCode & Logger.masks.newLine && envHasNewline()) console.log();
        const time = `[${Logger.timestamp}]`;
        const info = f.yellow(`W${code}`);
        const msg = WARN_TEXT[code];
        console.warn(`${time} ${info} ${msg}`);
        return true;
    }

    public static error(code: ErrorCode): true {
        const codifiedCode = Logger.CodifyCode(code);
        if (codifiedCode & Logger.masks.noLogInProd && envIsProd()) return true;
        if (codifiedCode & Logger.masks.noLogInDev && envIsDev()) return true;
        if (codifiedCode & Logger.masks.isRenderLog && envHasLogNoRender()) return true;
        if (codifiedCode & Logger.masks.newLine && envHasNewline()) console.log();
        const time = `[${Logger.timestamp}]`;
        const info = f.red(`E${code}`);
        const msg = ERROR_TEXT[code];
        console.error(`${time} ${info} ${msg}`);
        return true;
    }

    /**
     * Don't log if the request is from the same host. For example, if the request is from a script tag.
     * @param req The request object.
     * @param method The log method to return if the request is not from the same host.
     */
    public static genLogNotSelf<T>(req: Request, method: T): T | (() => true) {
        if (envHasLogSelf()) return method;
        const referer = req.headers.get("referer");
        const refererHost = referer ? new URL(referer).hostname : undefined;
        const reqHost = new URL(req.url).hostname;
        if (reqHost !== refererHost) return method;
        return (): true => true;
    }
}

export const INFO_CODE = <const>{
    ServerListening: 600,
    RequestReceived: 681,
    NotFoundControl: 650,
    GlobalMiddlewareResponse: 652,
    LocalMiddlewareResponse: 653,
    LocalCustomResponse: 654,
    PageIgnoreLayout: 655,
    DocumentRender: 662,
    LayoutRender: 663,
    PageRender: 664,
    RouteHandlerInvoked: 665,
    GlobalMiddlewareInvoked: 667,
};
export type InfoCode = (typeof INFO_CODE)[keyof typeof INFO_CODE];

export const INFO_TEXT = <const>{
    [INFO_CODE.ServerListening]: "Server Listening",
    [INFO_CODE.RequestReceived]: "Request Received",
    [INFO_CODE.NotFoundControl]: "Not Found Control Code Encountered",
    [INFO_CODE.GlobalMiddlewareResponse]: "Global Middleware returned a Response",
    [INFO_CODE.LocalMiddlewareResponse]: "Middleware Returned a Response",
    [INFO_CODE.LocalCustomResponse]: "Custom Response Returned",
    [INFO_CODE.PageIgnoreLayout]: "Page Ignores Inherited Layouts",
    [INFO_CODE.DocumentRender]: "Document Render",
    [INFO_CODE.LayoutRender]: "Layout Render",
    [INFO_CODE.PageRender]: "Page Render",
    [INFO_CODE.RouteHandlerInvoked]: "Route Handler Invoked",
    [INFO_CODE.GlobalMiddlewareInvoked]: "Global Middleware Invoked",
};
export type InfoText = (typeof INFO_TEXT)[keyof typeof INFO_TEXT];

export const WARN_CODE = <const>{};
export type WarnCode = (typeof WARN_CODE)[keyof typeof WARN_CODE];

export const WARN_TEXT = <const>{};
export type WarnText = (typeof WARN_TEXT)[keyof typeof WARN_TEXT];

export const ERROR_CODE = <const>{
    ErrorHandlerCalled: 800,
};
export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export const ERROR_TEXT = <const>{
    [ERROR_CODE.ErrorHandlerCalled]: "Error Handler Called",
};
export type ErrorText = (typeof ERROR_TEXT)[keyof typeof ERROR_TEXT];
