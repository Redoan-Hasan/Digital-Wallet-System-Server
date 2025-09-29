import httpStatus  from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response , NextFunction } from "express";
import { catchHandler } from "../../utils/catchHandler";
import { AuthServices } from "./auth.services";
import { sendResponse } from "../../utils/sendResponse";
import AppError from '../../errorHelpers/AppError';
import { setCookie } from '../../utils/setCookie';
import { JwtPayload } from 'jsonwebtoken';

const credentialsLoging = catchHandler(async (req: Request, res: Response, next: NextFunction) => {
  const result = await AuthServices.credentialsLoging(req.body);
  setCookie(res,{accessToken: result.accessToken, refreshToken: result.refreshToken});
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User login successfully',
    data: result,
  });
});


const getNewAccessToken = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Refresh Token is required");
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);
    // setCookie(res, tokenInfo)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "New Access Token generated Successfully",
      data: tokenInfo,
    });
  }
);

const logout = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  }
);

const resetPassword = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;
    await AuthServices.resetPassword(req.body, decodedToken);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Reseted Successfully",
      data: null,
    });
  }
);

const changePassword = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const decodedToken = req.user;
    await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Changed Successfully",
      data: null,
    });
  }
);

const changePin = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const oldPin = req.body.oldPin;
    const newPin = req.body.newPin;
    const decodedToken = req.user;
    await AuthServices.changePin(
      oldPin,
      newPin,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Pin Changed Successfully",
      data: null,
    });
  }
);

export const AuthController = {
  credentialsLoging,
  getNewAccessToken,
  logout,
  resetPassword,
  changePassword,
  changePin
};