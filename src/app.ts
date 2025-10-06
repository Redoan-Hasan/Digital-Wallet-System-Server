import expressSession  from 'express-session';
import express, { Request, Response } from "express";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFoundRoute from "./app/middlewares/notFoundRoute";
import cookieParser from "cookie-parser";
import envVars from "./app/config/env";
import cors from "cors";

const app = express();
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin : envVars.FRONTEND_URL,
  credentials:true
}));
app.use("/api/v1", router);
app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to Digital Wallet System Server!");
});

app.use(globalErrorHandler);
app.use(notFoundRoute);
export default app;
