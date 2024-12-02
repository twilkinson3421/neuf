/**
 * Provides decorators for type-checking Neuf layouts and pages.
 *
 * @module
 */

import type * as Lib from "../lib/types.ts";

export function NeufLayout(constructor: Lib.LayoutClass): void {
    constructor;
}

export function NeufPage(constructor: Lib.PageClass): void {
    constructor;
}
