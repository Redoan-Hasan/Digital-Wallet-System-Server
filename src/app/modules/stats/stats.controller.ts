/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { catchHandler } from "../../utils/catchHandler";
import { sendResponse } from "../../utils/sendResponse";
import { statsServices } from "./stats.services";
import { NextFunction, Request, Response } from 'express';

const getUserStats = catchHandler(async (req: Request, res: Response , next: NextFunction) => {
  const userStats = await statsServices.getUserStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Stats fetched successfully",
    data: userStats,
  });
});

const getTransactionStats = catchHandler(async (req: Request, res: Response , next: NextFunction) => {
  const transactionStats = await statsServices.getTransactionStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction Stats fetched successfully",
    data: transactionStats,
  });
}
)

export const statsController = {
  getUserStats,
  getTransactionStats
};