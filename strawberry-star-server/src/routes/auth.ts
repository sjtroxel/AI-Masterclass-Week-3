import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken"; // ✅ Import the whole default object
const { sign } = jwt;           // ✅ Destructure the sign function from it
import { UserModel } from "../models/User.js";
import type { LoginBody, RegisterBody, AuthResponse, JwtPayload } from "../types/auth.js";

export const authRouter = Router();

const BCRYPT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

const SEVEN_DAYS_SECS = 7 * 24 * 60 * 60;

function signToken(payload: JwtPayload): string {
  return sign(payload, getJwtSecret(), { expiresIn: SEVEN_DAYS_SECS });
}

// POST /api/auth/register
authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, username } = req.body as RegisterBody;

      if (!email || !password) {
        res.status(400).json({ status: "error", message: "email and password are required" });
        return;
      }

      const existing = await UserModel.findOne({ email });
      if (existing) {
        res.status(409).json({ status: "error", message: "Email already registered" });
        return;
      }

      const hashedPassword = await hash(password, BCRYPT_ROUNDS);
      const user = await UserModel.create({ email, password: hashedPassword, username });

      const payload: JwtPayload = {
        id: String(user._id),
        email: user.email,
        username: user.username,
      };

      const token = signToken(payload);

      const body: AuthResponse = {
        token,
        user: { id: payload.id, email: payload.email, username: payload.username },
      };

      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as LoginBody;

      if (!email || !password) {
        res.status(400).json({ status: "error", message: "email and password are required" });
        return;
      }

      const INVALID_MSG = "Invalid email or password";

      const user = await UserModel.findOne({ email }).select("+password");

      if (!user) {
        res.status(401).json({ status: "error", message: INVALID_MSG });
        return;
      }

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ status: "error", message: INVALID_MSG });
        return;
      }

      const payload: JwtPayload = {
        id: String(user._id),
        email: user.email,
        username: user.username,
      };

      const token = signToken(payload);

      const body: AuthResponse = {
        token,
        user: { id: payload.id, email: payload.email, username: payload.username },
      };

      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  }
);
