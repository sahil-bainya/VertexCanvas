import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { VisitLog } from "../models/loginLog.model.js";
import { getClientInfo } from "../utils/clientInfo.js";

export const trackVisit = asyncHandler(async (req, res) => {
  const { sessionId, path, referer, language, screen, timezone } = req.body;

  if (!sessionId) {
    return res.status(200).json(new ApiResponse(200, {}, "Skipped"));
  }

  const info = getClientInfo(req);

  await VisitLog.create({
    sessionId,
    path: path || "/",
    ip: info.ip,
    country: info.country,
    city: info.city,
    timezone: timezone || info.timezone,
    device: info.device,
    userAgent: info.userAgent,
    referer: referer || info.referer,
    language: language || info.language,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Tracked"));
});
