import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";
const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Board",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    canvasData: {
      type: Array,
      default: [],
    },
    boardNotes: {
      type: Array,
      default: [],
    },
    arrows: {
      type: Array,
      default: [],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    pendingRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
    collaborators: [
      {
        // ← list of approved users to collab
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const Board = mongoose.model("Board", boardSchema);
