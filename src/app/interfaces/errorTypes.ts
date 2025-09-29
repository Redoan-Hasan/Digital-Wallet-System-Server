export interface TErrorSources {
    path: string;
    message: string;
}
export interface TGlobalErrorResponse {
    statusCode: number;
    message: string;
    errorSources?: TErrorSources[];
}