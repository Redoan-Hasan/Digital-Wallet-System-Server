/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import envVars from "../config/env";
import mongoose from "mongoose";
import { handleDuplicateKeyError } from "../helpers/handleDuplicateKeyError";
import { handleCastError } from "../helpers/handleCastError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSources } from "../interfaces/errorTypes";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(error);
  }
  let statusCode = 500;
  let message = error.message;

  let errorSources: TErrorSources[] = [];
  // mongoose duplicate key error
  if (error.code === 11000) {
    const err = handleDuplicateKeyError(error);
    statusCode = err.statusCode;
    message = err.message;
  }
  //mongoose cast error/ invalid ObjectId
  else if (error.name === "CastError") {
    const err = handleCastError(error);
    statusCode = err.statusCode;
    message = err.message;
  }
  // zod error
  else if (error.name === "ZodError") {
    const err = handleZodError(error);
    statusCode = err.statusCode;
    message = err.message;
    errorSources = err.errorSources as TErrorSources[];
  }
  //mongoose validation error
  else if (error.name === "ValidationError") {
    const err = handleValidationError(error);
    statusCode = err.statusCode;
    message = err.message;
    errorSources = err.errorSources as TErrorSources[];
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    statusCode = 500;
    message = error.message;
  }
  res.status(statusCode).send({
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === "development" ? error : null,
    stack: envVars.NODE_ENV === "development" ? error.stack : null,
  });
};
