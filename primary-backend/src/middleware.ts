import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

export interface AuthenticatedRequest extends Request {
  id?: number;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"] as string | undefined;

  if (!authHeader) {
    return res.status(403).json({
      message: "You are not logged in"
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const payload = jwt.verify(token, JWT_PASSWORD) as { id: number };
    req.id = payload.id;
    next();
  } catch (e) {
    return res.status(403).json({
      message: "Invalid or expired token"
    });
  }
}
