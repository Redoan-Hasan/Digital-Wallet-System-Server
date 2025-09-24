import dotenv from "dotenv";
dotenv.config();

//interface for environment variables
export interface IEnvVars {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
}

const loadEnvVars = (): IEnvVars => {
  const requiredEnvs: string[] = ["PORT", "DB_URL", "NODE_ENV"];
  requiredEnvs.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable ${envVar}`);
    }
  });
  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
  };
};

const envVars: IEnvVars = loadEnvVars();
export default envVars;
