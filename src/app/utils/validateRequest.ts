import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (zodSchema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
