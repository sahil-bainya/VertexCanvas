import toast from "react-hot-toast";
import { Check, CircleX, Info, PartyPopper } from "lucide-react";
import CloseBtn from "./CloseBtn";

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
        <div className="flex items-start gap-3 bg-white border border-green-200 rounded-xl px-4! py-3! shadow-lg shadow-green-900/5 w-full">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 shrink-0">
            <Check size={15} className="text-green-600" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-gray-800 flex-1 wrap-break-word min-w-0 pt-0.5">
            {message}
          </span>
          <CloseBtn
            onClick={() => toast.dismiss(t.id)}
            colorClass="text-gray-400 hover:text-green-600 hover:bg-green-50"
          />
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
        <div className="flex items-center gap-3 bg-white border border-indigo-200 rounded-xl px-4! py-3! shadow-lg shadow-indigo-900/5 w-full">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 shrink-0">
            <PartyPopper
              size={15}
              className="text-indigo-600"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-sm font-medium text-gray-800 flex-1 wrap-break-word min-w-0">
            {message}
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
        <div className="flex items-start gap-3 bg-white border border-red-200 rounded-xl px-4! py-3! shadow-lg shadow-red-900/5 w-full">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 shrink-0">
            <CircleX size={15} className="text-red-600" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-gray-800 flex-1 wrap-break-word min-w-0 pt-0.5">
            {message}
          </span>
          <CloseBtn
            onClick={() => toast.dismiss(t.id)}
            colorClass="text-gray-400 hover:text-red-600 hover:bg-red-50"
          />
        </div>
      ),
      {
        duration: 4000,
        style: toastBaseStyle,
      },
    ),

  info: (message) =>
    toast(
      (t) => (
        <div className="flex items-start gap-3 bg-white border border-blue-200 rounded-xl px-4! py-3! shadow-lg shadow-blue-900/5 w-full">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 shrink-0">
            <Info size={15} className="text-blue-600" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-medium text-gray-800 flex-1 wrap-break-word min-w-0 pt-0.5">
            {message}
          </span>
          <CloseBtn
            onClick={() => toast.dismiss(t.id)}
            colorClass="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          />
        </div>
      ),
      {
        duration: 4000,
        style: toastBaseStyle,
      },
    ),
};
