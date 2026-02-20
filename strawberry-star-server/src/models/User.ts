import mongoose from "mongoose";
import type { Document, Model } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password: string;
  username?: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  username: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema);
