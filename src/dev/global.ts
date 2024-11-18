import * as N from "./lib.types.ts";
import { NeufLayout as _NeufLayout, NeufPage as _NeufPage } from "../decorators/lib.ts";

declare global {
    export import Neuf = N;

    /** Class decorator for a Neuf layout */
    function NeufLayout<T extends N.StaticLayout>(constructor: T): void;
    /** Class decorator for a Neuf page */
    function NeufPage<T extends N.StaticPage>(constructor: T): void;
}

/** Initialize Neuf decorators on the global object */
export function initGlobalDecorators(): void {
    globalThis.NeufLayout = _NeufLayout;
    globalThis.NeufPage = _NeufPage;
}
