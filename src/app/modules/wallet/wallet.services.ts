import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "../transaction/transaction.model";
import { Wallet } from "./wallet.model";
import { Role, Status } from "../user/user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { walletSearchableFields } from "./wallet.constants";

// add money for user and agent both
const addMoney = async (payload: ITransaction, decodedToken: JwtPayload) => {
  const isUserExist = await User.findById(decodedToken.id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  if (isUserExist.role !== decodedToken.role) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You only can add money to your own wallet"
    );
  }
  if (isUserExist.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are BLOCKED. You can't add money to your wallet"
    );
  }
  const wallet = await Wallet.findOne({ _id: isUserExist.wallet });
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet does not exist");
  }
  if (wallet.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your wallet is blocked. You can't add money to it."
    );
  }

  if (!payload.addMoneySource) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide a valid source of adding money"
    );
  }
  if (payload.amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount should be greater than zero"
    );
  }
  const session = await Transaction.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.create(
      [
        {
          ...payload,
          user: isUserExist._id,
          wallet: wallet._id,
          status: TransactionStatus.COMPLETED,
          transactionType:
            decodedToken.role === Role.USER
              ? TransactionType.ADD
              : TransactionType.ADD_MONEY_BY_AGENT,
        },
      ],
      { session }
    );
    wallet.balance += payload.amount;
    wallet.transactions?.push(transaction[0]._id);
    await wallet.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { transaction: transaction[0], currentAmount: wallet.balance };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// withdraw money for user and agent both
const withdrawMoney = async (
  payload: ITransaction,
  decodedToken: JwtPayload
) => {
  let transactionFee = 0;
  const isUserExist = await User.findById(decodedToken.id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  if (isUserExist.role !== decodedToken.role) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You only can withdraw money from your own wallet"
    );
  }
  if (isUserExist.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are BLOCKED. You can't withdraw money from your wallet"
    );
  }
  const wallet = await Wallet.findOne({ _id: isUserExist.wallet });
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet does not exist");
  }
  if (wallet.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your wallet is blocked. You can't withdraw money from it."
    );
  }
  if (!payload.withdrawMoneySource) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide a valid source of withdrawing money"
    );
  }
  if (payload.amount + transactionFee > wallet.balance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient balance in the wallet. Required: ${
        payload.amount + transactionFee
      }, Available: ${wallet.balance}`
    );
  }
  if (payload.amount > 0) {
    transactionFee = (payload.amount * 2) / 100;
  }
  const session = await Transaction.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.create(
      [
        {
          ...payload,
          user: isUserExist._id,
          wallet: wallet._id,
          status: TransactionStatus.COMPLETED,
          transactionFee,
          transactionType:
            decodedToken.role === Role.USER
              ? TransactionType.WITHDRAW
              : TransactionType.WITHDRAW_MONEY_BY_AGENT,
        },
      ],
      {
        session,
      }
    );
    wallet.balance = wallet.balance - (payload.amount + transactionFee);
    wallet.transactions?.push(transaction[0]._id);
    await wallet.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { transaction: transaction[0], currentAmount: wallet.balance };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// cashin money by agent
const cashInMoney = async (payload: ITransaction, decodedToken: JwtPayload) => {
  let transactionFee = 0;

  if (!payload.receiverWallet) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "toAccount (receiver wallet) is required for cash-in"
    );
  }
  if (payload.amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be greater than zero"
    );
  }
  if (payload.amount < 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Minimum amount for cash-in is 100"
    );
  }

  const agent = await User.findById(decodedToken.id);
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent does not exist");
  }
  if (agent.role !== Role.AGENT) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only agents can perform cash-in"
    );
  }
  if (agent.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked. You can't perform cash-in operation."
    );
  }

  const senderWallet = await Wallet.findById(agent.wallet);
  if (!senderWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet does not exist");
  }
  if (senderWallet.status === Status.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Agent wallet is blocked");
  }

  const receiverWallet = await Wallet.findById(payload.receiverWallet);
  if (!receiverWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet does not exist");
  }
  if (receiverWallet.status === Status.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet is blocked");
  }

  // Prevent self-transfer
  if (senderWallet._id.equals(receiverWallet._id)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot perform cash-in to the same wallet"
    );
  }

  // Calculate transaction fee
  if (payload.amount > 0) {
    transactionFee = (payload.amount * 5) / 100;
  }

  // Balance validation (moved after fee calculation)
  if (payload.amount + transactionFee > senderWallet.balance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient balance in the agent's wallet. Required: ${
        payload.amount + transactionFee
      }, Available: ${senderWallet.balance}`
    );
  }

  // Validate receiver user exists and is not blocked
  const receiverUser = await User.findById(receiverWallet.user);
  if (!receiverUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver user does not exist");
  }
  if (receiverUser.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Receiver user is blocked. Cannot perform cash-in."
    );
  }
  if (receiverUser.role !== Role.USER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cash-in can only be performed to USER accounts."
    );
  }

  const session = await Transaction.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.create(
      [
        {
          ...payload,
          wallet: senderWallet._id,
          senderWallet: senderWallet._id,
          receiverWallet: receiverWallet._id,
          user: agent._id,
          status: TransactionStatus.COMPLETED,
          transactionFee,
          transactionType: TransactionType.CASH_IN,
        },
      ],
      { session }
    );

    senderWallet.balance -= payload.amount + transactionFee;
    receiverWallet.balance += payload.amount;

    senderWallet.transactions?.push(transaction[0]._id);
    receiverWallet.transactions?.push(transaction[0]._id);

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();
    session.endSession();
    return {
      transaction: transaction[0],
      senderWalletBalance: senderWallet.balance,
      receiverWalletBalance: receiverWallet.balance,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// cashout money by user
const cashOutMoney = async (
  payload: ITransaction,
  decodedToken: JwtPayload
) => {
  let transactionFee = 0;

  if (!payload.receiverWallet) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Agent wallet is required for cash-out"
    );
  }
  if (payload.amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be greater than zero"
    );
  }
  if (payload.amount < 100) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Minimum amount for cash-out is 100"
    );
  }

  const sender = await User.findById(decodedToken.id);
  if (!sender) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  if (sender.role !== Role.USER) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only users can perform cash-out"
    );
  }
  if (sender.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked. You can't perform cash-in operation."
    );
  }

  const senderWallet = await Wallet.findById(sender.wallet);
  if (!senderWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Your wallet does not exist");
  }
  if (senderWallet.status === Status.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }

  const receiverWallet = await Wallet.findById(payload.receiverWallet);
  if (!receiverWallet) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Provided Agent wallet does not exist"
    );
  }
  if (receiverWallet.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Provided Agent wallet is blocked"
    );
  }

  const agent = await User.findById(receiverWallet.user);
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent does not exist");
  }
  if (agent.role !== Role.AGENT) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cash-out can only be performed to AGENT accounts."
    );
  }
  if (senderWallet._id.equals(receiverWallet._id)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot perform cash-out to the same wallet"
    );
  }

  if (payload.amount > 0) {
    transactionFee = (payload.amount * 5) / 100;
  }

  if (payload.amount + transactionFee > senderWallet.balance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Insufficient balance in your wallet."
    );
  }

  const session = await Transaction.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.create(
      [
        {
          ...payload,
          wallet: sender._id,
          senderWallet: sender._id,
          receiverWallet: receiverWallet._id,
          user: agent._id,
          status: TransactionStatus.COMPLETED,
          transactionFee,
          transactionType: TransactionType.CASH_OUT,
        },
      ],
      { session }
    );

    senderWallet.balance -= payload.amount + transactionFee;
    receiverWallet.balance += payload.amount;

    senderWallet.transactions?.push(transaction[0]._id);
    receiverWallet.transactions?.push(transaction[0]._id);

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();
    session.endSession();
    return {
      transaction: transaction[0],
      senderWalletBalance: senderWallet.balance,
      receiverWalletBalance: receiverWallet.balance,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// send money by user
const sendMoney = async (payload: ITransaction, decodedToken: JwtPayload) => {
  let transactionFee = 0;

  if (!payload.receiverWallet) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Receiver wallet is required for sending money"
    );
  }
  if (payload.amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Amount must be greater than zero"
    );
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
  }
  if (user.role !== Role.USER) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only users can perform cash-in"
    );
  }
  if (user.status === Status.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked. You can't perform cash-in operation."
    );
  }

  const senderWallet = await Wallet.findById(user.wallet);
  if (!senderWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Your wallet does not exist");
  }
  if (senderWallet.status === Status.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
  }

  const receiverWallet = await Wallet.findById(payload.receiverWallet);
  if (!receiverWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet does not exist");
  }
  if (receiverWallet.status === Status.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet is blocked");
  }
  const receiverUser = await User.findById(receiverWallet.user);
  if (!receiverUser) {
    throw new AppError(httpStatus.NOT_FOUND, "Receiver user does not exist");
  }
  if (receiverUser.status === Status.BLOCKED) {
    throw new AppError(httpStatus.FORBIDDEN, "Receiver user is blocked.");
  }
  if (receiverUser.role !== Role.USER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Money can only be sent to USER accounts."
    );
  }

  if (senderWallet._id.equals(receiverWallet._id)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot send money to the same wallet"
    );
  }

  if (payload.amount > 0) {
    transactionFee = (payload.amount * 2) / 100;
  }

  if (payload.amount + transactionFee > senderWallet.balance) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Insufficient balance in the agent's wallet. Required: ${
        payload.amount + transactionFee
      }, Available: ${senderWallet.balance}`
    );
  }

  const session = await Transaction.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.create(
      [
        {
          ...payload,
          wallet: senderWallet._id,
          senderWallet: senderWallet._id,
          receiverWallet: receiverWallet._id,
          user: user._id,
          status: TransactionStatus.COMPLETED,
          transactionFee,
          transactionType: TransactionType.SEND_MONEY,
        },
      ],
      { session }
    );

    senderWallet.balance -= payload.amount + transactionFee;
    receiverWallet.balance += payload.amount;

    senderWallet.transactions?.push(transaction[0]._id);
    receiverWallet.transactions?.push(transaction[0]._id);

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await session.commitTransaction();
    session.endSession();
    return {
      transaction: transaction[0],
      senderWalletBalance: senderWallet.balance,
      receiverWalletBalance: receiverWallet.balance,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyWallet = async (decodedToken: JwtPayload) => {
  const wallet = await Wallet.find({ user: decodedToken.id })
    .select("-_id -transactions -createdAt -updatedAt")
    .populate("user", "name email -_id");

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet does not exist");
  }
  return wallet;
};
const getSingleWallet = async (id: string) => {
  const wallet = await Wallet.find({ _id: id })
    .select(" -transactions -createdAt -updatedAt")
    .populate("user", "name email");

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet does not exist");
  }
  return wallet;
};

const getAllWallets = async (query: Record<string, string>, role: string) => {
  if (role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Only admin can get all transactions"
    );
  }
  const queryBuilder = new QueryBuilder(
    Wallet.find().populate("user", "name email"),
    query,
    "Wallet"
  );
  const wallets = queryBuilder
    .search(walletSearchableFields)
    .filter()
    .sort()
    .field()
    .paginate();
  wallets.modelQuery = wallets.modelQuery.select("-transactions");
  const [data, meta] = await Promise.all([
    wallets.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
  };
};

export const WalletServices = {
  addMoney,
  withdrawMoney,
  cashInMoney,
  cashOutMoney,
  sendMoney,
  getMyWallet,
  getSingleWallet,
  getAllWallets,
};
