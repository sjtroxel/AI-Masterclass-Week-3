import jwt from "jsonwebtoken";
const { verify } = jwt;
import type { Request, Response, NextFunction } from "express";
import type { AuthUser, JwtPayload } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: "error", message: "No token provided" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    next(new Error("JWT_SECRET is not configured"));
    return;
  }

  try {
    const payload = verify(token, secret) as JwtPayload;
    req.user = { id: payload.id, email: payload.email, username: payload.username };
    next();
  } catch {
    res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
}
