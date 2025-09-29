import { TGlobalErrorResponse } from "../interfaces/errorTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDuplicateKeyError = (error: any): TGlobalErrorResponse => {
  const matchedArray = error.message.match(/"([^"]*)"/);
  return {
    statusCode: 400,
    message: `Duplicate key error: ${matchedArray[1]}`,
  };
};
