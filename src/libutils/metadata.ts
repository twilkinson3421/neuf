import { createElement as c } from "preact";
import { render as JSXRender } from "preact-render-to-string";

import type { Metadata } from "../dev/lib.types.ts";

export function resolveMetadata(data: Metadata): string {
    const d = data;
    const els: Array<preact.JSX.Element | undefined> = <const>[
        d.title ? c("title", null, d.title) : undefined,
        d.base ? c("base", d.base) : undefined,

        ...(d.meta ? d.meta.map(m => c("meta", m)) : []),
        ...(d.links ? d.links.map(l => c("link", l)) : []),
        ...(d.scripts ? d.scripts.map(s => c("script", s)) : []),
        ...(d.style ? d.style.map(s => c("style", s)) : []),
    ];

    return els
        .filter(e => !!e)
        .map(JSXRender)
        .join("");
}
