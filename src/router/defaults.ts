import type { RouterOptions } from "./index.ts";

export const ROUTER_DEFAULTS = (<const>{
    fsRoot: "src/app",
    patterns: {
        document: /^[A-Za-z0-9]+\.document\.(js|ts|jsx|tsx)$/,
        layout: /^[A-Za-z0-9]+\.layout\.(js|ts|jsx|tsx)$/,
        routeHandler: /^[A-Za-z0-9]+\.route\.(js|ts|jsx|tsx)$/,
        pages: {
            default: /^[A-Za-z0-9]+\.page\.(js|ts|jsx|tsx)$/,
            notFound: /^[A-Za-z0-9]+\.page\.not-found\.(js|ts|jsx|tsx)$/,
            error: /^[A-Za-z0-9]+\.page\.error\.(js|ts|jsx|tsx)$/,
        },
        dir: {
            dynamic: {
                pattern: /^\[[^\]^\.]*\]$/,
                getName: (fsName: string) => fsName.slice(1, -1),
                getFsName: (name: string) => `[${name}]`,
            },
            catchAll: {
                pattern: /^\[\.\.\.[^\]]*\]$/,
                getName: (fsName: string) => fsName.slice(4, -1),
                getFsName: (name: string) => `[...${name}]`,
            },
            group: /^\([^\)]*\)$/,
        },
    },
}) satisfies RouterOptions;
