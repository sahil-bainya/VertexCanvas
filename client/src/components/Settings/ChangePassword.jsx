import { useForm } from "react-hook-form";
import { Input, Button } from "../";
import { useState } from "react";
import api from "../../services/api.js";
import { notify } from "../../utils/toast.jsx";
export default function ChangePassword({ onClose }) {
  const { handleSubmit, register } = useForm();
  const [loading, setLoading] = useState(false);
  const update = async (data) => {
    setLoading(true);
    try {
      await api.patch("/user/change-password", data);
      {
        notify.success("Password updated!");
      }
    } catch (err) {
      {
        notify.error(
          err?.response?.data?.message ||
            "Something went wrong while updating user profile",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5! card shadow-sm bg-base-100">
      <h2>Change Password</h2>
      <form
        onSubmit={handleSubmit(update)}
        className="flex flex-col gap-4 justify-center"
      >
        <Input
          type="password"
          label="Old Password "
          placeholder="Old Password"
          {...register("oldPassword", {
            required: "Old Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
        />
        <Input
          type="password"
          label="New Password "
          placeholder="New Password"
          {...register("newPassword", {
            required: "New Password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
        />
        <div className="flex gap-2 justify-end">
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
