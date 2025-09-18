import type { Response } from "express";
import { HttpStatusCode } from "../constants/enums.ts";

type SuccessResponseType = {
  res: Response;
  data: Record<string, any> | string;
  status?: HttpStatusCode;
  statusCode?: string | "ok";
};

type ErrorType = {
  message: string;
  details: any;
};

type ErrorResponseType = Omit<
  SuccessResponseType,
  "status" | "data" | "statusCode"
> & {
  error: ErrorType;
  status?: HttpStatusCode;
  statusCode?: string | "error";
};

export function successResponse({
  res,
  data = {},
  status = HttpStatusCode.OK,
  statusCode = "ok",
}: SuccessResponseType) {
  res.status(status).json({
    success: true,
    data,
    statusCode,
  });
}

export function errorResponse({
  res,
  error,
  status = HttpStatusCode.INTERNAL_SERVER_ERROR,
  statusCode = "error",
}: ErrorResponseType) {
  res.status(status).json({
    success: false,
    error,
    statusCode,
  });
}
