export const CONTROL_CODE = <const>{
    NotFound: Symbol("NotFound"),
    ServerError: Symbol("ServerError"),
};

export type ControlCode = (typeof CONTROL_CODE)[keyof typeof CONTROL_CODE];
