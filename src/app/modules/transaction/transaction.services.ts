import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../user/user.interface";
import { Transaction } from "./transaction.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { transactionSearchableFields } from "./transactions.constants";
import { User } from "../user/user.model";

const getMyTransactions = async (
  query: Record<string, string>,
  id: string,
  role: string
) => {
  if (role === Role.ADMIN) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Admin can't get my transactions cause you don't have any wallet"
    );
  }
  const user = await User.findById(id);
  const queryBuilder = new QueryBuilder(
    Transaction.find({
      $or: [
        { user: user?._id },
        { wallet: user?.wallet },
        { senderWallet: user?.wallet },
        { receiverWallet: user?.wallet },
      ],
    })
      .populate("user", "name email phone")
      .populate({
        path: "receiverWallet",
        select: "user",
        populate: {
          path: "user",
          select: "name phone -_id",
        },
      })
      .populate({
        path: "senderWallet",
        select: "user",
        populate: {
          path: "user",
          select: "name phone -_id",
        },
      }),
    query,
    "Transaction"
  );
  const transactions = await queryBuilder
    .search(transactionSearchableFields)
    .filter()
    .sort()
    .field()
    .paginate();
  const [data, meta] = await Promise.all([
    transactions.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};
const getAllTransactions = async (
  query: Record<string, string>,
  role: string
) => {
  if (role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only admin can get all transactions"
    );
  }
  const queryBuilder = new QueryBuilder(
    Transaction.find()
      .populate("user", "name email phone")
      .populate({
        path: "receiverWallet",
        select: "user",
        populate: {
          path: "user",
          select: "name phone",
        },
      })
      .populate({
        path: "senderWallet",
        select: "user",
        populate: {
          path: "user",
          select: "name phone",
        },
      }),
    query,
    "Transaction"
  );
  const transactions = await queryBuilder
    .search(transactionSearchableFields)
    .filter()
    .sort()
    .field()
    .paginate();
  const [data, meta] = await Promise.all([
    transactions.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

export const transactionServices = {
  getMyTransactions,
  getAllTransactions,
};
