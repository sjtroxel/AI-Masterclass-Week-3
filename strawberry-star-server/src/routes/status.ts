import { Router } from "express";
import type { Request, Response } from "express";

export interface StatusResponse {
  message: string;
  version: string;
}

export const statusRouter = Router();

statusRouter.get("/", (_req: Request, res: Response) => {
  const body: StatusResponse = {
    message: "Hello from Strawberry Server",
    version: "1.0.0",
  };
  res.json(body);
});
