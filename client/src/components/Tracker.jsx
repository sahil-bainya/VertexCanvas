import { useEffect } from "react";
import { useLocation, Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { trackVisit } from "../utils/tracker.js";

export default function Tracker() {
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.status);
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    if (loading || isLoggedIn) return;
    trackVisit(location.pathname);
  }, [location.pathname, isLoggedIn, loading]);

  if (loading) return null;
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}