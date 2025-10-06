import bcrypt  from 'bcryptjs';
import httpStatus  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { createUserToken, newAccessTokenWithRefreshToken } from '../../utils/userTokens';
import { IUser } from '../user/user.interface';
import envVars from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';

const credentialsLoging = async (payload: Partial<IUser>) => {
  const isUserExist = await User.findOne({ email: payload.email }).select("+password +pin");
  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  const isPasswordMatched = await bcrypt.compare(
    payload.password as string,
    isUserExist.password as string
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect password");
  }

  const tokens = createUserToken(isUserExist);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, pin, ...userWithoutPass } = isUserExist.toObject();
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: userWithoutPass,
  };
};


const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await newAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken: newAccessToken,
  };
};

const resetPassword = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload : Record<string, any>,
  decodedToken: JwtPayload
) => {
  const {id, newPassword} = payload;
  if(id !== decodedToken.id){
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized request");
  }
  const isUserExist = await User.findById(decodedToken.id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  isUserExist.password = await bcrypt.hash(newPassword, envVars.BCRYPT_SALT_ROUNDS);
  await isUserExist.save();
  return;
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.id).select("+password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  const isOldPasswordMatched = await bcrypt.compare(
    oldPassword,
    user.password as string
  );
  if (!isOldPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old password is incorrect");
  }
  user.password = await bcrypt.hash(newPassword, envVars.BCRYPT_SALT_ROUNDS);
  await user.save();
  return;
};


const changePin = async (
  oldPin: string,
  newPin: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.id).select("+pin");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  const isOldPinMatched = await bcrypt.compare(
    oldPin,
    user.pin
  );
  if (!isOldPinMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old pin is incorrect");
  }
  user.pin = await bcrypt.hash(newPin, envVars.BCRYPT_SALT_ROUNDS);
  await user.save();
  return;
};
export const AuthServices = {
  credentialsLoging,
  getNewAccessToken,
  resetPassword,
  changePassword,
  changePin,
};