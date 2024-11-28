import { createElement as c } from "preact";
import { render as JSXRender } from "preact-render-to-string";
import type { JSX } from "preact";
import type * as Lib from "./types.ts";

export function resolveMetadata(data: Lib.Metadata): string {
    const d = data;
    const els: Array<JSX.Element | undefined> = <const>[
        d.title ? c("title", null, d.title) : undefined,
        d.base ? c("base", d.base) : undefined,

        ...(d.meta ? d.meta.map(m => c("meta", m)) : []),
        ...(d.links ? d.links.map(l => c("link", l)) : []),
        ...(d.scripts ? d.scripts.map(s => c("script", s)) : []),
        ...(d.styles ? d.styles.map(s => c("style", s)) : []),
    ];

    return els
        .filter(e => !!e)
        .map(JSXRender)
        .join("");
}
