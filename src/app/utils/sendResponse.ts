import { Response } from "express";
import { IResponse } from "./utilsTypes";

export const sendResponse = <DataType>(res:Response, data:IResponse<DataType>) =>{
    res.status(data.statusCode).send({
        success: data.success,
        message: data.message,
        data: data.data,
    })
}