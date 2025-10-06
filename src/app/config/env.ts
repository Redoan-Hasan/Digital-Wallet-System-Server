import dotenv from "dotenv";
dotenv.config();

//interface for environment variables
export interface IEnvVars {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  BCRYPT_SALT_ROUNDS: number;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;
  DEFAULT_ADMIN_EMAIL : string;
  DEFAULT_ADMIN_PASSWORD : string;
  DEFAULT_ADMIN_PIN : string;
  FRONTEND_URL : string;
  EXPRESS_SESSION_SECRET : string;
}

const loadEnvVars = (): IEnvVars => {
  const requiredEnvs: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUNDS",
    "JWT_ACCESS_TOKEN_SECRET",
    "JWT_ACCESS_TOKEN_EXPIRES_IN",
    "JWT_REFRESH_TOKEN_EXPIRES_IN",
    "JWT_REFRESH_TOKEN_EXPIRES_IN",
    "DEFAULT_ADMIN_EMAIL",
    "DEFAULT_ADMIN_PASSWORD",
    "DEFAULT_ADMIN_PIN",
    "FRONTEND_URL",
    "EXPRESS_SESSION_SECRET",
  ];
  requiredEnvs.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable ${envVar}`);
    }
  });
  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string,
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL as string,
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD as string,
    DEFAULT_ADMIN_PIN: process.env.DEFAULT_ADMIN_PIN as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
  };
};

const envVars: IEnvVars = loadEnvVars();
export default envVars;
