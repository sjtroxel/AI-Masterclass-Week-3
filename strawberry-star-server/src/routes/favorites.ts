import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { FavoriteModel } from "../models/Favorite.js";

export const favoritesRouter = Router();

// GET /api/favorites — return all starIds for the authenticated user
favoritesRouter.get(
  "/",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const docs = await FavoriteModel.find({ userId }).select("starId -_id");
      const starIds = docs.map((d) => d.starId);
      res.status(200).json({ starIds });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/favorites/toggle — add or remove a favorite
favoritesRouter.post(
  "/toggle",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { starId } = req.body as { starId: unknown };

      if (typeof starId !== "number" || !Number.isFinite(starId)) {
        res.status(400).json({ status: "error", message: "starId must be a finite number" });
        return;
      }

      const userId = req.user!.id;
      const existing = await FavoriteModel.findOne({ userId, starId });

      if (existing) {
        await FavoriteModel.deleteOne({ userId, starId });
        res.status(200).json({ favorited: false, starId });
      } else {
        await FavoriteModel.create({ userId, starId });
        res.status(200).json({ favorited: true, starId });
      }
    } catch (err) {
      next(err);
    }
  },
);
