import httpStatus from "http-status-codes";
import { Request, Response } from "express";

const notFoundRoute = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).send({
    success: false,
    message: "Route not found",
  });
};

export default notFoundRoute;
