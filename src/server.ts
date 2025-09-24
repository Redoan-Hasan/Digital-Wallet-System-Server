/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import envVars from "./app/config/env";
let server: Server;
const port = envVars.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("connected to db");
    server = app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  console.log("unhandledRejection detected , shutting down the server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.log("uncaught excetion detected , shutting down the server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// throw new Error("Uncaught Exception error");

process.on("SIGTERM", () => {
  console.log("SIGTERM signal detected , shutting down the server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal detected , shutting down the server");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
