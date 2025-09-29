import { Request, Response, NextFunction } from "express";
import { IcatchAsync } from "./utilsTypes";

export const catchHandler = (func : IcatchAsync) => async(req : Request,res :Response,next :NextFunction)=>{
    try {
      await func(req,res,next);
    } catch (error) {
      next(error)
    }
}