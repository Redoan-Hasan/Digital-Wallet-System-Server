import express, { Request, Response } from "express";

const app = express();
app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to Digital Wallet System Server!");
});
export default app;
