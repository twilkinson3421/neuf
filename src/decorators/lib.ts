import type * as N from "../dev/lib.types.ts";

export function NeufPage<T extends N.StaticPage>(constructor: T): void {
    constructor;
}

export function NeufLayout<T extends N.StaticLayout>(constructor: T): void {
    constructor;
}
