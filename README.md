# @neuf/neuf

A simple barebones SSR web framework for Deno. Uses preact JSX for templating. Support for file-based routing, dynamic routes, catch-all routes, and route-groups. Build pages using JSX components, pages, layouts, 'documents', and 'route-handlers'.

## Basic Usage

```ts
import { listen, serve, router, type Lib } from "@neuf/neuf";
import { relative, join } from "@std/join";
import { render } from "preact-render-to-string";

const importFn: Lib.ServeOptions["importFn"] = async path => {
    const thisModuleDir = import.meta.dirname!;
    const toCwd = relative(thisModuleDir, Deno.cwd());
    const fullPath = join(toCwd, path);
    return await import(fullPath);
};

listen({
    hostname: "0.0.0.0",
    port: 8080,
    handler: (req, res, isError) => {
        return serve(req, res, {
            isError,
            isNotFound: false,
            staticOptions: { fsRoot: "src/public", quiet: true },
            importFn,
            router,
            renderJSX: render,
        });
    },
});
```

## Planned Features

- First-party i18n solution
- Middleware support
- More informative logging

## License

[MIT](LICENSE)
