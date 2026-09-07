// utils/toast.js
import toast from "react-hot-toast";
import { X, Check, CircleX } from "lucide-react";

const toastBaseStyle = {
  background: "transparent",
  boxShadow: "none",
  padding: 0,
  border: "none",
  maxWidth: "420px",
  width: "100%",
};

export const notify = {
  success: (message) =>
    toast(
      (t) => (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-3! py-2! shadow-sm w-full">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 shrink-0 mt-0.5">
            <Check size={14} color="#16a34a" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-green-900 flex-1 wrap-break-word min-w-0">
            {message}
          </span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-green-400 hover:text-green-600 hover:bg-green-100 rounded p-0.5 transition-colors shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ),
      {
        duration: 2000,
        style: toastBaseStyle,
      },
    ),

  welcome: (message) =>
    toast(
      () => (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4! py-2! shadow-sm w-full">
          <span className="text-sm font-medium text-blue-900 flex-1 wrap-break-word min-w-0">
            👋 {message}!
          </span>
        </div>
      ),
      {
        duration: 1500,
        id: message,
        style: toastBaseStyle,
      },
    ),

  error: (message) =>
    toast(
      (t) => (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-3! py-2! shadow-sm w-full">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 shrink-0 mt-0.5">
            <CircleX size={14} color="#FF0000" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-red-900 flex-1 wrap-break-word min-w-0">
            {message}
          </span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-red-400 hover:text-red-600 hover:bg-red-100 rounded p-0.5 transition-colors shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ),
      {
        duration: 4000,
        style: toastBaseStyle,
      },
    ),
};
