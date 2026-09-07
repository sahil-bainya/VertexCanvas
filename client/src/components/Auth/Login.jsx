import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import "./authStyle.css";
import { notify } from "../../utils/toast.jsx";
import { Button, Input } from "../";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const login = async (data) => {
    setLoading(true);
    try {
      setError("");
      const res = await api.post("/user/login", data);
      dispatch(setUser(res.data.data.user));
      notify.welcome(`Welcome back ${res.data.data.user.name}!`);
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form-inner" onSubmit={handleSubmit(login)}>
      <h1>Sign In</h1>
      <div className="auth-divider" />

      <div className="auth-input-group">
        <label>Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          {...register("email", {
            required: "Email is required",
            validate: {
              matchPattern: (value) =>
                /^\S+@\S+\.\S+$/.test(value) || "Email address must be valid",
            },
          })}
        />
        <span className="auth-input-error">{errors.email?.message}</span>
      </div>

      <div className="auth-input-group">
        <label>Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
        />
        <span className="auth-input-error">{errors.password?.message}</span>
      </div>

      <a href="#" className="auth-forgot">
        Forgot your password?
      </a>

      {error && <div className="auth-error-box">{error}</div>}

      <Button className="auth-submit-btn" type="submit" loading={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
