import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

export const getClientInfo = (req) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    req.ip;

  const cleanIP = ip?.replace(/^::ffff:/, "");
  const geo = cleanIP ? geoip.lookup(cleanIP) : null;

  const ua = req.headers["user-agent"] || "";
  const parser = new UAParser(ua);
  const result = parser.getResult();

  let deviceType = "desktop";
  if (result.device.type === "mobile") deviceType = "mobile";
  else if (result.device.type === "tablet") deviceType = "tablet";

  return {
    ip: cleanIP || "unknown",
    country: geo?.country || "unknown",
    city: geo?.city || "unknown",
    timezone: geo?.timezone || "unknown",
    device: {
      deviceType: deviceType,
      os: result.os.name
        ? `${result.os.name} ${result.os.version || ""}`.trim()
        : "unknown",
      browser: result.browser.name || "unknown",
    },
    userAgent: ua,
    referer: req.headers.referer || null,
    language: req.headers["accept-language"] || null,
  };
};
