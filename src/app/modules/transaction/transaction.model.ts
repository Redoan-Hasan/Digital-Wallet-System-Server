import { model, Schema } from "mongoose";
import { addMoneySource, ITransaction, TransactionStatus, TransactionType, withdrawMoneySource } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    user: { 
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionType: {
      type: String,
      enum: Object.values(TransactionType) ,
    },
    amount: {
      type: Number,
      
      required: true,
    },
    senderWallet: { 
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    receiverWallet: { 
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    transactionFee: {
        type: Number,
        default: 0,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    addMoneySource: {
      type: String,
      enum: Object.values(addMoneySource),
    },
    withdrawMoneySource: {
      type: String,
      enum: Object.values(withdrawMoneySource),
    },
  },
  {
    timestamps: true,
    versionKey:false,
  }
);

export const Transaction = model<ITransaction>("Transaction", transactionSchema);