import denoJson from "../../deno.json" with { type: "json" };
export const SERVER_NAME = `${denoJson.xRegistry}/${denoJson.name}/${denoJson.version}`;