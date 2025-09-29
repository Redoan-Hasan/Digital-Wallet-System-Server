import mongoose from "mongoose";
import { TGlobalErrorResponse } from "../interfaces/errorTypes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleCastError = (error: mongoose.Error.CastError) : TGlobalErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid Mongoose ObjectId",
  };
};
