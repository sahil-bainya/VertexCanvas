import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function Public({ children }) {
  const { status, loading } = useSelector((state) => state.auth);

  if (loading) return <p>Loading...</p>;

  if (status) return <Navigate to="/dashboard" replace />;

  return children;
}