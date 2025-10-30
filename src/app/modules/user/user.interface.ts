import { Types } from "mongoose";
export enum AgentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPEND = 'SUSPEND',
  REJECTED = 'REJECTED',
  NONE = "NONE"
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export enum Status {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: Types.ObjectId;
  wallet: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  pin : string;
  role: Role;
  status: Status;
  agentStatus?: string; // only for agents
  createdAt?: Date;
}
