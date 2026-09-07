import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function Protected({ children }) {
  const { status, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  if (loading) return <p>Loading...</p>;
  if (!status)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />; // redirect to login without page render
  return children;
}
