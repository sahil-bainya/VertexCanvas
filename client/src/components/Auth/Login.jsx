import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../../services/api.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice.js";
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
    <form
      className="flex flex-col items-center justify-center w-full gap-1"
      onSubmit={handleSubmit(login)}
    >
      <h1 className="text-2xl font-extrabold text-base-content !mb-1">Sign In</h1>
      <div className="w-10 h-[3px] rounded bg-gradient-to-r from-primary to-secondary !mb-4" />

      <div className="w-full flex flex-col gap-1 !mb-1">
        <label className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider !pl-0.5">
          Email
        </label>
        <Input
          type="email"
          placeholder="you@example.com"
          className="w-full bg-base-200 border-2 border-transparent focus:border-primary focus:bg-base-100 rounded-lg !px-3.5 !py-2.5 text-sm text-base-content placeholder:text-base-content/40 outline-none transition-colors"
          {...register("email", {
            required: "Email is required",
            validate: {
              matchPattern: (value) =>
                /^\S+@\S+\.\S+$/.test(value) || "Email address must be valid",
            },
          })}
        />
        <span className="text-[11px] text-error !pl-0.5 min-h-[16px]">
          {errors.email?.message}
        </span>
      </div>

      <div className="w-full flex flex-col gap-1 !mb-1">
        <label className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider !pl-0.5">
          Password
        </label>
        <Input
          type="password"
          placeholder="••••••••"
          className="w-full bg-base-200 border-2 border-transparent focus:border-primary focus:bg-base-100 rounded-lg !px-3.5 !py-2.5 text-sm text-base-content placeholder:text-base-content/40 outline-none transition-colors"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
        />
        <span className="text-[11px] text-error pl-0.5! min-h-[16px]">
          {errors.password?.message}
        </span>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg text-error text-xs !px-3 !py-2 w-full text-center">
          {error}
        </div>
      )}

      <Button
        className="w-full rounded-full border-none bg-gradient-to-r from-primary to-secondary text-primary-content text-xs font-extrabold uppercase tracking-widest !py-3 !mt-2 hover:opacity-90 active:scale-[0.97] transition disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        loading={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}