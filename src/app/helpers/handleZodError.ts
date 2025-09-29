/* eslint-disable @typescript-eslint/no-explicit-any */

import { TErrorSources, TGlobalErrorResponse } from "../interfaces/errorTypes";

export const handleZodError = (error : any): TGlobalErrorResponse => {
    const errorSources: TErrorSources[] = [];
    error.issues.forEach((issue: any) =>
      errorSources.push({
        path: issue.path[issue.path.length - 1],
        message: issue.message,
      })
    );
    return {
      statusCode: 400,
      message: "Zod Error",
      errorSources,
    };
};