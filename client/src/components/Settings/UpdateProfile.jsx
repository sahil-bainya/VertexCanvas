import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Input, Button } from "../";
import api from "../../services/api.js";
import { setUser } from "../../store/authSlice.js";
import { notify } from "../../utils/toast.jsx";
export default function UpdateProfile({ onClose }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });
  const [loading, setLoading] = useState(false);
  const update = async (data) => {
    setLoading(true);
    try {
      console.log(data);
      const updatedUser = await api.patch("/user/update", data);
      console.log(updatedUser);

      notify.success("Details updated!");
      dispatch(setUser(updatedUser.data.data));
      onClose();
    } catch (err) {
      notify.error(
        err?.response?.data?.message ||
          "Something went wrong while updating user profile",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-3 p-5! card shadow-sm bg-base-100">
      <h2>Update Profile Details</h2>
      <form
        onSubmit={handleSubmit(update)}
        className="flex flex-col gap-4 justify-center"
      >
        <Input
          type="email"
          error={errors.email?.message}
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
            validate: {
              matchPattern: (value) =>
                /^\S+@\S+\.\S+$/.test(value) || "Email address must be valid",
            },
          })}
        />
        <Input
          type="text"
          placeholder="name"
          error={errors.name?.message}
          {...register("name", {
            required: "name is required",
          })}
        />

        <div className="flex gap-2 justify-end !">
          <Button className="btn" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            children="Update"
            loading={loading}
            buttonType="btn-soft btn-info"
          />
        </div>
      </form>
    </div>
  );
}
