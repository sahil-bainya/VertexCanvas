import mongoose from "mongoose";

const visitLogSchema = new mongoose.Schema(
  {
    // Optional - agar logged in hai toh
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    email: {
      type: String,
      default: null,
    },

    // Session tracking (anonymous users ke liye)
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    // Client info
    ip: String,
    country: String,
    city: String,
    timezone: String,
    device: {
      deviceType: {
        type: String,
        default: "unknown",
      },
      os: String,
      browser: String,
    },
    userAgent: String,
    referer: String,
    language: String,

    // Page info
    path: String, // /, /login, /dashboard
    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    // Session data
    duration: {
      type: Number,
      default: 0, // seconds on page
    },
  },
  { timestamps: true },
);

// Auto-delete after 90 days
visitLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

export const VisitLog = mongoose.model("VisitLog", visitLogSchema);
