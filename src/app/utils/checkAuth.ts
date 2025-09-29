import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./jwt";
import envVars from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { Status } from "../modules/user/user.interface";
import AppError from "../errorHelpers/AppError";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "No token provided");
    }
    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT_ACCESS_TOKEN_SECRET
    ) as JwtPayload;
    if (!verifiedToken) {
      throw new AppError(httpStatus.FORBIDDEN, "Invalid Token");
    }
    const isUserExist = await User.findOne({ email: verifiedToken.email });
    if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
    }
    if (isUserExist.status === Status.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `User is ${isUserExist.status}`
      );
    }
    if (!authRoles.includes(verifiedToken.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to perform this action"
      );
    }
    req.user = verifiedToken;
    next();
  };
