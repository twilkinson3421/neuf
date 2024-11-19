/** Control codes to modify the behaviour of the Neuf serve function. */
export enum NeufControl {
    /**
     * The request should be handled as a 404.
     * If a 404 page is defined, it will be served.
     */
    NotFound = "NEUF_CONTROL_CODE__NOT_FOUND",
}
