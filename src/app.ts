import express, { Request, Response } from "express";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFoundRoute from "./app/middlewares/notFoundRoute";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", router);
app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to Digital Wallet System Server!");
});

app.use(globalErrorHandler);
app.use(notFoundRoute);
export default app;
