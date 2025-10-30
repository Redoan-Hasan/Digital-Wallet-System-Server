import httpStatus from "http-status-codes";
import envVars from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { AgentStatus, IUser, Role, Status } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constants";

const createUser = async (payload: IUser) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const isUserExist = await User.findOne({ email: payload.email });
    if (isUserExist) {
      throw new AppError(httpStatus.CONFLICT, "Email already exists");
    }
    const isPhoneExist = await User.findOne({ phone: payload.phone });
    if (isPhoneExist) {
      throw new AppError(httpStatus.CONFLICT, "Phone number already exists");
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
    const wallet = await Wallet.create(
      [
        {
          user: user[0]._id,
          balance: 50,
          status: Status.ACTIVE,
        },
      ],
      { session }
    );
    user[0].wallet = wallet[0]._id;
    await user[0].save({ session });
    await session.commitTransaction();
    session.endSession();
    const userObject = user[0]?.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, pin, ...userWithoutSensitiveData } = userObject;

    return {
      user: userWithoutSensitiveData,
      wallet: wallet[0].toObject(),
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query, "User");
  const allUsers = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .field()
    .paginate();
  const [data, meta] = await Promise.all([
    allUsers.build(),
    queryBuilder.getMeta(),
  ]);
  return {
    data,
    meta,
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
const getAllPendingAgents = async () => {
  const pendingAgents = await User.find({
    agentStatus: AgentStatus.PENDING,
  });
  return {
    data: pendingAgents,
    meta: {
      total: pendingAgents.length,
    },
  };
};
const getAllApprovedAgents = async () => {
  const approvedAgents = await User.find({
    agentStatus: AgentStatus.APPROVED,
  });
  return {
    data: approvedAgents,
    meta: {
      total: approvedAgents.length,
    },
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
  if (isUserExist.status === Status.BLOCKED && payload.status !== Status.ACTIVE) {
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
  if (
    payload.role &&
    payload.role !== Role.ADMIN &&
    payload.role !== Role.USER &&
    payload.role !== Role.AGENT
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
  }
  if (
    payload?.status &&
    payload.status !== Status.ACTIVE &&
    payload.status !== Status.BLOCKED
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid status");
  }
  if (
    payload?.agentStatus &&
    payload.agentStatus !== AgentStatus.PENDING &&
    payload.agentStatus !== AgentStatus.APPROVED &&
    payload.agentStatus !== AgentStatus.SUSPEND &&
    payload.agentStatus !== AgentStatus.REJECTED &&
    payload.agentStatus !== AgentStatus.NONE
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid agent status");
  }
  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return updatedUser;
};
const makeMeAgent = async (verifiedToken: JwtPayload) => {
  if (verifiedToken.role !== Role.USER) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to become an agent"
    );
  }
  const isUserExist = await User.findById(verifiedToken.id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (isUserExist.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are BLOCKED. You can't become an agent"
    );
  }
  if (isUserExist.role === Role.AGENT) {
    throw new AppError(httpStatus.FORBIDDEN, "You are already an agent");
  }
  const updatedUser = await User.findByIdAndUpdate(
    verifiedToken.id,
    { $set: { agentStatus: AgentStatus.PENDING } },
    {
      new: true,
      runValidators: true,
    }
  );
  return updatedUser;
};
const makeAgent = async (id: string, verifiedToken: JwtPayload) => {
  if (verifiedToken.role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to become an agent"
    );
  }
  const isUserExist = await User.findById(id);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (isUserExist.status === "BLOCKED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are BLOCKED. You can't become an agent"
    );
  }
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: { role: Role.AGENT, agentStatus: AgentStatus.APPROVED } },
    {
      new: true,
      runValidators: true,
    }
  );
  return updatedUser;
};

export const userServices = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateUser,
  makeMeAgent,
  makeAgent,
  getAllPendingAgents,
  getAllApprovedAgents,
};
