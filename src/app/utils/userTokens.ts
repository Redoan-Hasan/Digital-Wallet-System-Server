import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import envVars from "../config/env";
import { Status, IUser } from "../modules/user/user.interface";
import { generateJWTToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";

export const createUserToken = (user: Partial<IUser>) => {
  const JwtPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateJWTToken(
    JwtPayload,
    envVars.JWT_ACCESS_TOKEN_SECRET,
    envVars.JWT_ACCESS_TOKEN_EXPIRES_IN
  );
  const refreshToken = generateJWTToken(
    JwtPayload,
    envVars.JWT_REFRESH_TOKEN_SECRET,
    envVars.JWT_REFRESH_TOKEN_EXPIRES_IN
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const newAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_TOKEN_SECRET
  ) as JwtPayload;
  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });
  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (
    isUserExist.status === Status.BLOCKED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.status}`
    );
  }
  const JwtPayload = {
    id: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateJWTToken(
    JwtPayload,
    envVars.JWT_ACCESS_TOKEN_SECRET,
    envVars.JWT_ACCESS_TOKEN_EXPIRES_IN
  );
  return accessToken;
};
