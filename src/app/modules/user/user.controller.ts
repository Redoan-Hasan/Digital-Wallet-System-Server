/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchHandler } from "../../utils/catchHandler";
import { userServices } from "./user.services";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env";
import { verifyToken } from "../../utils/jwt";

const createUser = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body);
    
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
);

const getAllUsers = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.getAllUsers();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All users retrieved successfully",
      data: result,
    });
  }
);

const getSingleUser = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.getSingleUser(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });
  }
);


const getMe = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await userServices.getMe(req?.user?.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,  
      success: true,
      message: "Your info retrieved successfully",
      data: result,
    });
  }
);
const updateUser = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;
    const token = req.headers.authorization;
    const verifiedToken = verifyToken(
      token as string,
      envVars.JWT_ACCESS_TOKEN_SECRET
    ) as JwtPayload;
    console.log("verifiedToken:", verifiedToken);
    const updatedUser = await userServices.updateUser(
      userId,
      payload,
      verifiedToken
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,  
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  }
);



export const userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateUser,
};
