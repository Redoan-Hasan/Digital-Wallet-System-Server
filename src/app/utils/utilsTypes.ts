import { Request, Response, NextFunction } from "express";
export type IcatchAsync = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export interface IResponse<DataType> {
  statusCode: number;
  success: boolean;
  message: string;
  data: DataType;
}

