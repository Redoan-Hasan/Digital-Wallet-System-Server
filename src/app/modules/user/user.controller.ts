/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchHandler } from "../../utils/catchHandler";
import { userServices } from "./user.services";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import envVars from "../../config/env";
import { verifyToken } from "../../utils/jwt";
import { Role } from "./user.interface";
import AppError from "../../errorHelpers/AppError";

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
    if(req.user?.role !== Role.ADMIN){
      throw new AppError(httpStatus.FORBIDDEN, "Only admin can access this route")
    }
    const result = await userServices.getAllUsers(req.query as Record<string, string>);
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

const getAllPendingAgents = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if(req.user?.role !== Role.ADMIN){
      throw new AppError(httpStatus.FORBIDDEN, "Only admin can access this route")
    }
    const result = await userServices.getAllPendingAgents();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All pending agents retrieved successfully",
      data: result,
    });
  }
)
const getAllApprovedAgents = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if(req.user?.role !== Role.ADMIN){
      throw new AppError(httpStatus.FORBIDDEN, "Only admin can access this route")
    }
    const result = await userServices.getAllApprovedAgents();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All approved agents retrieved successfully",
      data: result,
    });
  }
)
const updateUser = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;
    const token = req.headers.authorization;
    const verifiedToken = verifyToken(
      token as string,
      envVars.JWT_ACCESS_TOKEN_SECRET
    ) as JwtPayload;
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
const makeMeAgent = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const verifiedToken = verifyToken(
      token as string,
      envVars.JWT_ACCESS_TOKEN_SECRET
    ) as JwtPayload;
    const updatedUser = await userServices.makeMeAgent(
      verifiedToken
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,  
      success: true,
      message: "Your agent status has been changed successfully",
      data: updatedUser,
    });
  }
);

const makeAgent = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const token = req.headers.authorization;
    const verifiedToken = verifyToken(
      token as string,
      envVars.JWT_ACCESS_TOKEN_SECRET
    ) as JwtPayload;
    const updatedUser = await userServices.makeAgent(
      userId,
      verifiedToken
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,  
      success: true,
      message: "User has been made an agent successfully",
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
  makeMeAgent,
  makeAgent,
  getAllPendingAgents,
  getAllApprovedAgents
};
