import type * as N from "../dev/lib.types.ts";

/** Class decorator for a Neuf layout */
export function NeufLayout<T extends N.StaticLayout>(constructor: T): void {
    constructor;
}

/** Class decorator for a Neuf page */
export function NeufPage<T extends N.StaticPage>(constructor: T): void {
    constructor;
}
