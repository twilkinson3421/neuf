import { createElement } from "preact";
import { render as JSXRender } from "preact-render-to-string";

export function script(
    attrs: preact.JSX.HTMLAttributes<HTMLScriptElement>,
    ...children: preact.ComponentChildren[]
): string {
    return JSXRender(createElement(`script`, attrs, ...children));
}
