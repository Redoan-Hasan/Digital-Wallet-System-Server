import { Types } from "mongoose";
import { Status } from "../user/user.interface";
export interface IWallet {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  balance: number; 
  status: Status; 
  transactions?: Types.ObjectId[];
}