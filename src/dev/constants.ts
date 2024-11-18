import { STATUS_CODE, STATUS_TEXT } from "@std/http/status";

export const ERROR_STATUS: 500 = STATUS_CODE.InternalServerError;
export const NOT_FOUND_STATUS: 404 = STATUS_CODE.NotFound;

export const ERROR_TEXT: "Internal Server Error" = STATUS_TEXT[ERROR_STATUS];
export const NOT_FOUND_TEXT: "Not Found" = STATUS_TEXT[NOT_FOUND_STATUS];

const ERROR_INIT: ResponseInit = { status: ERROR_STATUS };
const NOT_FOUND_INIT: ResponseInit = { status: NOT_FOUND_STATUS };

export const ERROR_RESPONSE: Response = new Response(ERROR_TEXT, ERROR_INIT);
export const NOT_FOUND_RESPONSE: Response = new Response(NOT_FOUND_TEXT, NOT_FOUND_INIT);
