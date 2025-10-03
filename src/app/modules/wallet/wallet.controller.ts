/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchHandler } from "../../utils/catchHandler";
import { sendResponse } from "../../utils/sendResponse";
import { WalletServices } from "./wallet.services";
import { JwtPayload } from "jsonwebtoken";

const addMoney = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const decodedToken = req.user;
    const result = await WalletServices.addMoney(
      payload,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Money added successfully",
      data: result,
    });
  }
);
// const addMoneyForAgent = catchHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const payload = req.body;
//     const decodedToken = req.user;
//     const result = await WalletServices.addMoneyForAgent(
//       payload,
//       decodedToken as JwtPayload
//     );
//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Money added successfully by agent",
//       data: result,
//     });
//   }
// );

const withdrawMoney = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const decodedToken = req.user;
    const result = await WalletServices.withdrawMoney(
      payload,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Money withdrawn successfully",
      data: result,
    });
  }
);

const cashInMoney = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const decodedToken = req.user;
    const result = await WalletServices.cashInMoney(
      payload,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Money cashed in successfully",
      data: result,
    });
  }
);

const cashOutMoney = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const decodedToken = req.user;
    const result = await WalletServices.cashOutMoney(
      payload,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Money cash out successfully",
      data: result,
    });
  }
);


const sendMoney = catchHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const decodedToken = req.user;
    const result = await WalletServices.sendMoney(
      payload,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Money sent successfully",
      data: result,
    });
  }
);

export const WalletController = {
  addMoney,
  // addMoneyForAgent,
  withdrawMoney,
  cashInMoney,
  cashOutMoney,
  sendMoney,
};
