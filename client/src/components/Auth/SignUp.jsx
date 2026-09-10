import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { notify } from "../../utils/toast.jsx";
import { Button, Input } from "../";

export default function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async (data) => {
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (data.avatar[0]) {
        formData.append("avatar", data.avatar[0]);
      }
      const res = await api.post("/user/register", formData);
      dispatch(setUser(res.data.data.user));
      notify.welcome(`Welcome ${res.data.data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-base-200 border-2 border-transparent focus:border-primary focus:bg-base-100 rounded-lg !px-3.5 !py-2.5 text-sm text-base-content placeholder:text-base-content/40 outline-none transition-colors";
  const labelClass =
    "text-[11px] font-semibold text-base-content/60 uppercase tracking-wider !pl-0.5";

  return (
    <form
      className="flex flex-col items-center justify-center w-full gap-1"
      onSubmit={handleSubmit(create)}
    >
      <h1 className="text-2xl font-extrabold text-base-content !mb-1">Create Account</h1>
      <div className="w-10 h-[3px] rounded bg-gradient-to-r from-primary to-secondary !mb-4" />

      <div className="w-full flex flex-col gap-1 !mb-1">
        <label className={labelClass}>Name</label>
        <Input
          type="text"
          placeholder="Your full name"
          autoComplete="off"
          className={inputClass}
          {...register("name", { required: "Name is required" })}
        />
        <span className="text-[11px] text-error !pl-0.5 min-h-[16px]">
          {errors.name?.message}
        </span>
      </div>

      <div className="w-full flex flex-col gap-1 !mb-1">
        <label className={labelClass}>Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="off"
          className={inputClass}
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
        <label className={labelClass}>Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          className={inputClass}
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum 6 characters" },
          })}
        />
        <span className="text-[11px] text-error !pl-0.5 min-h-[16px]">
          {errors.password?.message}
        </span>
      </div>

      <div className="w-full flex flex-col gap-1 !mb-1">
        <label className={labelClass}>
          Avatar <span className="normal-case tracking-normal text-base-content/40">(optional)</span>
        </label>
        <Input
          type="file"
          accept="image/*"
          className="w-full bg-base-200 border-2 border-transparent focus:border-primary rounded-lg !px-3.5 !py-2 text-xs text-base-content/60 outline-none transition-colors cursor-pointer file:!mr-3 file:!py-1.5 file:!px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-content file:text-xs file:cursor-pointer"
          {...register("avatar")}
        />
        <span className="text-[11px] text-error !pl-0.5 min-h-[16px]">
          {errors.avatar?.message}
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
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}