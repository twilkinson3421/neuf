/**
 * Logging utilities for Neuf. Should only be used for extending the functionality of Neuf.
 *
 * @module
 */

import * as Colors from "@hikyu/colors";
import * as Status from "@std/http/status";

function timestamp(): string {
    return `[${new Date().toISOString()}]`;
}

function statusColor(status: number): string {
    if (Status.isInformationalStatus(status)) return Colors.blue(status.toString());
    if (Status.isSuccessfulStatus(status)) return Colors.green(status.toString());
    if (Status.isRedirectStatus(status)) return Colors.magenta(status.toString());
    if (Status.isClientErrorStatus(status)) return Colors.red(status.toString());
    if (Status.isServerErrorStatus(status)) return Colors.red(status.toString());
    return status.toString();
}

export class Log {
    static response(req: Request, status: number, startTime: number): void {
        const duration = `(${Date.now() - startTime}ms)`;
        const cMethod = Colors.blue(req.method);
        const cStatus = statusColor(status);
        const path = new URL(req.url).pathname;
        console.info(`${timestamp()} ${duration} ${cMethod} ${cStatus} ${path}`);
    }

    static info(code: InfoCode, msg?: string): void {
        const info = Colors.blue(`I${code} ${INFO_TEXT[code]}`);
        if (msg) console.info(`${timestamp()} ${info} ${msg}`);
        else console.info(`${timestamp()} ${info}`);
    }
}

export const INFO_CODE = <const>{
    ServerListening: 600,
};

export type InfoCode = (typeof INFO_CODE)[keyof typeof INFO_CODE];

export const INFO_TEXT = <const>{
    [INFO_CODE.ServerListening]: "Server listening",
};

export type InfoText = (typeof INFO_TEXT)[keyof typeof INFO_TEXT];
