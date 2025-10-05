/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchHandler } from "../../utils/catchHandler";
import { sendResponse } from "../../utils/sendResponse";
import { transactionServices } from "./transaction.services";
import AppError from "../../errorHelpers/AppError";

const getMyTransactions = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const role = req.user?.role;
    if (!id || !role) {
      throw new AppError(httpStatus.UNAUTHORIZED, "please login first");
    }
    const result = await transactionServices.getMyTransactions(
      req.query as Record<string, string>,
      req.user?.id,
      req.user?.role
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions retrieved successfully",
      data: result,
    });
  }
);

const getAllTransactions = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      throw new AppError(httpStatus.UNAUTHORIZED, "please login first");
    }
    const result = await transactionServices.getAllTransactions(
      req.query as Record<string, string>,
      req.user?.role
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transactions retrieved successfully",
      data: result,
    });
  }
);
export const TransactionController = {
  getMyTransactions,
  getAllTransactions,
};
