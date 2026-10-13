import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { AuthForm } from "../components";
export default function AuthPage() {
  // const { status, loading } = useSelector((state) => state.auth);

  // if (loading) return null;
  // if (status) return <Navigate to="/dashboard" replace />;
  return <AuthForm />;
}
