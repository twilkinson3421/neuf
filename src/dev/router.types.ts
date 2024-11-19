export type Router = (req: Request) => Promise<PathData> | PathData;

/** Options for configuring the router. */
export interface RouterOptions {
    /** The root directory of the application (sometimes called the "pages" directory). */
    fsRoot: string;
    patterns: {
        /** A regular expression used to match a Neuf document file. */
        document: RegExp;
        /** A regular expression used to match a Neuf layout file. */
        layout: RegExp;
        page: {
            /** A regular expression used to match a Neuf page file. */
            default: RegExp;
            /** A regular expression used to match a Neuf 'Not Found' page file. */
            notFound: RegExp;
            /** A regular expression used to match a Neuf 'Error' page file. */
            error: RegExp;
        };
        /** A regular expression used to match a route handler file. */
        routeHandler: RegExp;
        dir: {
            dynamic: RegexAndName;
            catchAll: RegexAndName;
            /** A regular expression used to match a route-group directory name. */
            group: RegExp;
        };
    };
}

/** A regular expression and functions for extracting and rebuilding directory names */
export interface RegexAndName {
    /** A regular expression used to match the directory name. */
    pattern: RegExp;
    /**
     * A function which takes a directory name and returns the significant part of the name.
     * @param dirName The directory name as is appears in the file system.
     * @returns The significant part of the name.
     */
    getName: (dirName: string) => string;
    /**
     * A function which takes a processed directory name and returns the original directory name.
     * @param name The processed directory name.
     * @returns The original directory name as it appears in the file system.
     */
    rebuild: (name: string) => string;
}

/** An object containing file paths and request information needed to serve a response. */
export interface PathData {
    paths: {
        /** An artifact of the router. */
        dir: string;
        /** The file path to the nearest document file. */
        document: string;
        /** An array containing file paths to all of the inherited layout files. */
        layouts: string[];
        page: {
            /** The file path to the requested page file, if it exists. */
            default: string | undefined;
            /** The file path to the nearest 'Not Found' page file, if one exists. */
            notFound: string | undefined;
            /** The file path to the nearest 'Error' page file, if one exists. */
            error: string | undefined;
        };
        /**
         * The file path to the requested route handler, if it exists.
         * Takes precedence over `page.default`.
         */
        routeHandler: string | undefined;
    };
    url: {
        /** Dynamic URL Params from the request URL. */
        params: Params;
        /** URL Search Params from the request URL. */
        searchParams: URLSearchParams;
    };
}

/** A record containing dynamic URL parameters. */
export type Params<T extends Record<string, unknown> = Record<string, unknown>> = T;

export interface StaticPaths {
    document: string | undefined;
    layout: string | undefined;
    page: {
        default: string | undefined;
        notFound: string | undefined;
        error: string | undefined;
    };
    routeHandler: string | undefined;
}
