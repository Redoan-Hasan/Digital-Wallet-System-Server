import httpStatus from "http-status-codes";
import envVars from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { AgentStatus, IUser, Role, Status } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (payload: IUser) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const isUserExist = await User.findOne({ email: payload.email });
    if (isUserExist) {
      throw new AppError(httpStatus.CONFLICT, "Email already exists");
    }
    if (payload?.password) {
      const hashPassword = await bcrypt.hash(
        payload.password,
        envVars.BCRYPT_SALT_ROUNDS
      );
      payload.password = hashPassword;
    }
    if (payload?.pin) {
      const hashPin = await bcrypt.hash(
        payload.pin,
        envVars.BCRYPT_SALT_ROUNDS
      );
      payload.pin = hashPin;
    }
    const user = await User.create([payload], { session });
    const wallet = await Wallet.create([{
      user: user[0]._id,
      balance: 50,
      status: Status.ACTIVE,
    }], { session });
    user[0].wallet = wallet[0]._id;
    await user[0].save({ session });
    await session.commitTransaction();
    session.endSession();
    return {
      user: user,
      wallet: wallet,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUsers = async () => {
  const allUsers = await User.find();
  const allUsersCount = await User.countDocuments();
  return {
    data: allUsers,
    meta: {
      total: allUsersCount,
    },
  };
};

const getSingleUser = async (id: string) => {
  const singleUserInfo = await User.findById(id).select("-password");
  return {
    data: singleUserInfo,
  };
};

const getMe = async (id: string) => {
  const myInfo = await User.findById(id).select("-password");
  return {
    data: myInfo,
  };
};

const updateUser = async (
  id: string,
  payload: Partial<IUser>,
  verifiedToken: JwtPayload
) => {
  if (payload.status || payload.agentStatus) {
    if (verifiedToken.role !== Role.ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to update status or agentStatus"
      );
    }
  }
  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (verifiedToken.role !== Role.ADMIN) {
    if (verifiedToken.id !== id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to update this user"
      );
    }
  }
  if (isUserExist.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are BLOCKED. You can't update your profile"
    );
  }
  if (payload?.password) {
    const hashPassword = await bcrypt.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUNDS
    );
    payload.password = hashPassword;
  }
  if (payload?.pin) {
    const hashPin = await bcrypt.hash(payload.pin, envVars.BCRYPT_SALT_ROUNDS);
    payload.pin = hashPin;
  }
  if (payload?.role !== (Role.ADMIN || Role.USER || Role.AGENT)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
  }
  if (payload?.status !== (Status.ACTIVE || Status.BLOCKED)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status");
  }
  if (
    payload?.agentStatus !==
    (AgentStatus.PENDING || AgentStatus.APPROVED || AgentStatus.SUSPEND)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid agent status");
  }
  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
};

export const userServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateUser,
};
