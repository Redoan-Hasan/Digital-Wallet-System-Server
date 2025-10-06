import { TransactionStatus } from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { Status } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments();
  const totalActiveUsersPromise = User.countDocuments({
   status: Status.ACTIVE,
  });
  const totalBlockedUsersPromise = User.countDocuments({
    status: Status.BLOCKED,
  });
  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const userByRolePromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);
  const [
    totalUsers,
    totalActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    userByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalActiveUsersPromise,
    totalBlockedUsersPromise,
    newUsersInLast7DaysPromise,
    newUsersInLast30DaysPromise,
    userByRolePromise,
  ]);
  return {
    totalUsers,
    totalActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    userByRole,
  };
};
const getTransactionStats = async () => {
  const totalTransactionPromise = Transaction.countDocuments();
  const totalCompletedTransactionPromise = Transaction.countDocuments({
    status: TransactionStatus.COMPLETED,
  });
  const totalPendingTransactionPromise = Transaction.countDocuments({
    status: TransactionStatus.PENDING,
  });
  const totalReversedTransactionPromise = Transaction.countDocuments({
    status: TransactionStatus.REVERSED,
  });
  const transactionsInLast7DaysPromise = Transaction.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const transactionsInLast30DaysPromise = Transaction.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const transactionsByTypePromise = Transaction.aggregate([
    {
      $group: {
        _id: "$transactionType",
        count: { $sum: 1 },
      },
    },
  ]);
  const totalTransationAmountByTypePromise = Transaction.aggregate([
    {
      $group: {
        _id: "$transactionType",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
  const [
    totalTransaction,
    totalCompletedTransaction,
    totalPendingTransaction,
    totalReversedTransaction,
    transactionsInLast7Days,
    transactionsInLast30Days,
    transactionsByType,
    totalTransationAmountByType,
  ] = await Promise.all([
    totalTransactionPromise,
    totalCompletedTransactionPromise,
    totalPendingTransactionPromise,
    totalReversedTransactionPromise,
    transactionsInLast7DaysPromise,
    transactionsInLast30DaysPromise,
    transactionsByTypePromise,
    totalTransationAmountByTypePromise,
  ]);
  return {
    totalTransaction,
    totalCompletedTransaction,
    totalPendingTransaction,
    totalReversedTransaction,
    transactionsInLast7Days,
    transactionsInLast30Days,
    transactionsByType,
    totalTransationAmountByType,
  };
};

export const statsServices = {
  getUserStats,
  getTransactionStats,
};
