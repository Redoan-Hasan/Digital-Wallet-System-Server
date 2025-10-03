import { Types } from "mongoose";

export enum TransactionType {
  ADD = 'ADD',
  WITHDRAW = 'WITHDRAW',
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  SEND_MONEY = 'SEND_MONEY',
  ADD_MONEY_BY_AGENT = 'ADD_MONEY_BY_AGENT',
  WITHDRAW_MONEY_BY_AGENT = 'WITHDRAW_MONEY_BY_AGENT'
}
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
}

export enum addMoneySource {
  BANK = "BANK",
  CARD = "CARD",
  MOBILE_BANKING = "MOBILE_BANKING",
  OTHER = "OTHER",
}

export enum withdrawMoneySource {
  BANK = "BANK",
  CARD = "CARD",
  MOBILE_BANKING = "MOBILE_BANKING",
  OTHER = "OTHER",
}
export interface ITransaction {
  wallet: Types.ObjectId; 
  user: Types.ObjectId; 
  transactionType: TransactionType;
  amount: number;
  senderWallet?: Types.ObjectId; 
  receiverWallet?: Types.ObjectId; 
  transactionFee: number;
  status: TransactionStatus;
  addMoneySource?: addMoneySource;
  withdrawMoneySource?: withdrawMoneySource;
}