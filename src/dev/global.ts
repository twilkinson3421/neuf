import * as N from "./lib.types.ts";
import { NeufLayout as _NeufLayout, NeufPage as _NeufPage } from "../decorators/lib.ts";

declare global {
    export import Neuf = N;

    function NeufLayout<T extends N.StaticLayout>(constructor: T): void;
    function NeufPage<T extends N.StaticPage>(constructor: T): void;
}

export function initGlobalDecorators(): void {
    globalThis.NeufLayout = _NeufLayout;
    globalThis.NeufPage = _NeufPage;
}
