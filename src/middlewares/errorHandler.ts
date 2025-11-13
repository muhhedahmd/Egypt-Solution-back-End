import { Request, Response, NextFunction } from "express";
import { ServiceError } from "../errors/services.error";
import { ClientError } from "../errors/client.error";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  if (err instanceof ServiceError) {
    return res.status(err.statusCode ||500).json({
      success: false,
      message: err.message,
      code: err.code,
      name: err.name,
    });
  }
  if(err instanceof ClientError){
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code,
      name: err.name,
    });
    
  }
  if (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code,
      name: err.name,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}

