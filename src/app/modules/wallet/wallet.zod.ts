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
  phone: z.string().regex(/^01\d{9}$/, "Invalid phone number"),
  amount: z.number().positive("Amount must be greater than 0"),
});
export const sendMoneyZodSchema = z.object({
  phone: z.string().regex(/^01\d{9}$/, "Invalid phone number"),
  amount: z.number().positive("Amount must be greater than 0"),
});
