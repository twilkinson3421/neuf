import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";
import { METHOD as M } from "@std/http/unstable-method";

export const ERROR_STATUS: 500 = STATUS_CODE.InternalServerError;
export const NOT_FOUND_STATUS: 404 = STATUS_CODE.NotFound;
export const NO_CONTENT_STATUS: 204 = STATUS_CODE.NoContent;
export const METHOD_NA_STATUS: 405 = STATUS_CODE.MethodNotAllowed;

export const ERROR_TEXT: "Internal Server Error" = STATUS_TEXT[ERROR_STATUS];
export const NOT_FOUND_TEXT: "Not Found" = STATUS_TEXT[NOT_FOUND_STATUS];
export const NO_CONTENT_TEXT: "No Content" = STATUS_TEXT[NO_CONTENT_STATUS];
export const METHOD_NA_TEXT: "Method Not Allowed" = STATUS_TEXT[METHOD_NA_STATUS];

const ERROR_INIT: ResponseInit = { status: ERROR_STATUS };
const NOT_FOUND_INIT: ResponseInit = { status: NOT_FOUND_STATUS };
const NO_CONTENT_INIT: ResponseInit = { status: NO_CONTENT_STATUS };
const METHOD_NA_INIT: ResponseInit = { status: METHOD_NA_STATUS };

export const ERROR_RESPONSE: Response = new Response(ERROR_TEXT, ERROR_INIT);
export const NOT_FOUND_RESPONSE: Response = new Response(NOT_FOUND_TEXT, NOT_FOUND_INIT);
export const NO_CONTENT_RESPONSE: Response = new Response(null, NO_CONTENT_INIT);
export const METHOD_NOT_ALLOWED_RESPONSE: Response = new Response(METHOD_NA_TEXT, METHOD_NA_INIT);

const RH_SIMPLE_METHODS = <const>[M.Delete, M.Get, M.Head, M.Post];
const RH_OTHER_METHODS = <const>[M.Options, M.Patch, M.Put];
export const VALID_ROUTE_HANDLER_METHODS = <const>[...RH_SIMPLE_METHODS, ...RH_OTHER_METHODS];
