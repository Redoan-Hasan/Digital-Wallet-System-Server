import { Schema, model } from "mongoose";
import { AgentStatus, IUser, Role, Status } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    wallet : {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    pin:{
      type: String,
      required: [true, "Pin is required"],
      minlength: 4,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
    agentStatus: {
      type: String,
      enum: Object.values(AgentStatus),
      default: AgentStatus.NONE,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
