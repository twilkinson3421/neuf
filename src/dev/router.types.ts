export type Router = (req: Request) => Promise<PathData> | PathData;

export interface RouterOptions {
    fsRoot: string;
    patterns: {
        document: RegExp;
        layout: RegExp;
        page: {
            default: RegExp;
            notFound: RegExp;
            error: RegExp;
        };
        dir: {
            dynamic: RegexAndName;
            catchAll: RegexAndName;
            group: RegExp;
        };
    };
}

export interface RegexAndName {
    pattern: RegExp;
    getName: (dirName: string) => string;
    rebuild: (name: string) => string;
}

export interface PathData {
    paths: {
        dir: string;
        document: string;
        layouts: string[];
        page: {
            default: string | undefined;
            notFound: string | undefined;
            error: string | undefined;
        };
    };
    url: {
        params: Params;
        searchParams: URLSearchParams;
    };
}

export type Params<T extends Record<string, unknown> = Record<string, unknown>> = T;

export interface StaticPaths {
    document: string | undefined;
    layout: string | undefined;
    page: {
        default: string | undefined;
        notFound: string | undefined;
        error: string | undefined;
    };
}
