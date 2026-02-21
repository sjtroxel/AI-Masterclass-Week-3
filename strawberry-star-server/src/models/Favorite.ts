import mongoose from "mongoose";
import type { Document, Model } from "mongoose";

export interface FavoriteDocument extends Document {
  userId: string;
  starId: number;
  createdAt: Date;
}

const favoriteSchema = new mongoose.Schema<FavoriteDocument>({
  userId: { type: String, required: true },
  starId: { type: Number, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

favoriteSchema.index({ userId: 1, starId: 1 }, { unique: true });

export const FavoriteModel: Model<FavoriteDocument> =
  mongoose.model<FavoriteDocument>("Favorite", favoriteSchema);
