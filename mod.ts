// Copyright 2024 The Neuf authors. MIT License.
/**
 * A minimal SSR "framework" for building web applications using Deno.
 * Uses JSX for defining pages, layouts, and components.
 * Includes a file-based router similar to Next.js, and support for middleware.
 *
 * Is very early in development, and is not yet recommended for production use.
 * Expect breaking changes in future releases. You have been warned!
 *
 * _Module documentation will be added in a future release._
 * _Most exposed symbols are lightly documented with JSDoc._
 *
 * Coming soon:
 * - Better documentation!
 * - Examples
 * - Control over when promises are resolved (e.g. no need to block for a network request which has no effect on the page render)
 * - First-party error handling
 * - Dedicated API route-handlers
 * - Dedicated solution for i18n, among other things
 *
 * @module
 */

export * as Constants from "./src/dev/constants.ts";
export * as Decorators from "./src/decorators/lib.ts";
export * as Host from "./src/host/index.ts";
export * as Router from "./src/router/index.ts";
export * as RouterDefaults from "./src/router/defaults.ts";
export * as Serve from "./src/serve/index.ts";
export * as Types from "./src/dev/lib.types.ts";
