import { z } from "zod";
import {
  addMoneySource,
  withdrawMoneySource,
} from "../transaction/transaction.interface";

export const addMoneyZodSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  addMoneySource: z.enum(Object.values(addMoneySource), {
    message: "addMoneySource is required",
  }),
});
export const withdrawMoneyZodSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  withdrawMoneySource: z.enum(Object.values(withdrawMoneySource), {
    message: "addMoneySource is required",
  }),
});

export const cashInAndOutMoneyZodSchema = z.object({
  receiverWallet: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid toAccount ObjectId"),
  amount: z.number().positive("Amount must be greater than 0"),
});
export const sendMoneyZodSchema = z.object({
  receiverWallet: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid toAccount ObjectId"),
  amount: z.number().positive("Amount must be greater than 0"),
});
