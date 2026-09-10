import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../../services/api.js";
import { setUser } from "../../store/authSlice.js";
import { Button } from "../";
import { notify } from "../../utils/toast.jsx";
export default function UpdateAvatar({ onClose }) {
  const dispatch = useDispatch();
  const { handleSubmit, register } = useForm();
  const [loading, setLoading] = useState(false);

  const update = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", data.avatar[0]);
      const updatedUser = await api.patch("/user/avatar", formData);
      dispatch(setUser(updatedUser.data.data));
      notify.success("Image updated!");
      onClose?.();
    } catch (err) {
      notify.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5! card shadow-sm bg-base-100">
      <h2>Update Profile Image</h2>
      <form
        onSubmit={handleSubmit(update)}
        className="flex flex-col gap-4 justify-center"
      >
        <input
          type="file"
          className="file-input w-full"
          {...register("avatar")}
        />

        <div className="flex gap-2 justify-end">
          <Button className="btn" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            buttonType="btn-soft btn-info"
          >
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}
