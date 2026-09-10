import { useState } from "react";
import { Check, X } from "lucide-react";
import api from "../../services/api.js";
import { notify } from "../../utils/toast.jsx";

export default function RequestNotification({ request, onHandled }) {
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(null); // "accept" | "reject" | null

  const initials = request.userName
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleAccept = async () => {
    setLoading(true);
    setActioning("accept");
    try {
      await api.post(`/boards/${request.boardId}/accept-request`, {
        userId: request.userId,
      });
      notify.success("Access granted");
      onHandled(request.userId);
    } catch (err) {
      notify.error(`Failed to accept: ${err?.response?.data?.message}`);
    } finally {
      setLoading(false);
      setActioning(null);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setActioning("reject");
    try {
      await api.post(`/boards/${request.boardId}/reject-request`, {
        userId: request.userId,
      });
      notify.info("Request rejected");
      onHandled(request.userId);
    } catch (err) {
      notify.error(`Failed to reject: ${err?.response?.data?.message}`);
    } finally {
      setLoading(false);
      setActioning(null);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/50 p-2! transition-colors hover:bg-base-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-base-content">
          {request.userName}
        </p>
        <p className="text-xs text-base-content/60">Wants to join this board</p>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={handleReject}
          disabled={loading}
          className="btn btn-sm bg-error/10 text-error border-none hover:bg-error/20 disabled:opacity-50 gap-1 px-2! rounded-2xl"
        >
          {actioning === "reject" ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <X size={14} />
          )}
          Reject
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="btn btn-sm bg-success/10 text-success border-none hover:bg-success/20 disabled:opacity-50 gap-1 px-2! rounded-2xl"
        >
          {actioning === "accept" ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Check size={14} />
          )}
          Accept
        </button>
      </div>
    </div>
  );
}
