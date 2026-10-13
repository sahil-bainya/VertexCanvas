import api from "../services/api.js"

// Generate session ID per browser session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("visitSessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("visitSessionId", sessionId);
  }
  return sessionId;
};

export const trackVisit = async (path) => {
  try {
    const sessionId = getSessionId();
    
    await api.post("/track/visit", {
      sessionId,
      path: path || window.location.pathname,
      referer: document.referrer,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch (err) {
    // Silent fail - tracking se user experience kharab na ho
    console.log("Track error:", err.message);
  }
};