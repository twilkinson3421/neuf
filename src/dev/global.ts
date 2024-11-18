// import * as N from "./lib.types.ts";
// import { NeufLayout as _NeufLayout, NeufPage as _NeufPage } from "../decorators/lib.ts";

// declare global {
//     export import Neuf = N;

//     /** Class decorator for a Neuf layout */
//     function NeufLayout<T extends N.StaticLayout>(constructor: T): void;
//     /** Class decorator for a Neuf page */
//     function NeufPage<T extends N.StaticPage>(constructor: T): void;
// }

// /** Initialize Neuf decorators on the global object */
// export function initGlobalDecorators(): void {
//     globalThis.NeufLayout = _NeufLayout;
//     globalThis.NeufPage = _NeufPage;
// }

//! JSR does not allow augmenting the global object
//* Use this file as a template for adding global types & decorators in your project
// This functionality will be re-added if/when JSR supports it...

/**
 * @deprecated
 * JSR does not allow augmenting the global object
 */
export const WARNING: string = "JSR does not allow augmenting the global object";
