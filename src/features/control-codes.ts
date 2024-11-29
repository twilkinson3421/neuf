/**
 * Provides control codes for changing the behaviour of the serve function.
 *
 * @example
 * ```ts
 * import { CONTROL_CODE, type ControlCode } from "@neuf/neuf/control-codes";
 *
 * export class MyPage {
 *     init(): ControlCode {
 *         return CONTROL_CODE.NotFound;
 *     }
 *
 *     ...
 * }
 * ```
 *
 * @module
 */

export const CONTROL_CODE = <const>{
    NotFound: Symbol("NotFound"),
    ServerError: Symbol("ServerError"),
};

/** A control code. */
export type ControlCode = (typeof CONTROL_CODE)[keyof typeof CONTROL_CODE];
