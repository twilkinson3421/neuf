import { createElement } from "preact";
import { render as JSXRender } from "preact-render-to-string";

/**
 * Constructs a script element as a string.
 * @param attrs Attributes for the script element.
 * @param children Children (inner HTML) for the script element.
 * @returns A string containing the script element.
 */
export function script(
    attrs: preact.JSX.HTMLAttributes<HTMLScriptElement>,
    ...children: preact.ComponentChildren[]
): string {
    return JSXRender(createElement(`script`, attrs, ...children));
}
