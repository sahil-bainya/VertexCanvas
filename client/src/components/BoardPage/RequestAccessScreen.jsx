import { useState } from "react";
import api from "../../services/api.js";
import { notify } from "../../utils/toast.jsx";
export default function RequestAccessScreen({
  boardId,
  boardTitle,
  hasPendingRequest,
}) {
  const [requestSent, setRequestSent] = useState(hasPendingRequest);

  const handleRequestAccess = async () => {
    try {
      await api.post(`/boards/${boardId}/join-request`);
      setRequestSent(true);
      notify.success("Request sent!");
    } catch (err) {
      notify.error(`Failed to send request ${err}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4! ">
      <div className="card bg-base-100 shadow-xl w-full max-w-sm sm:max-w-md">
        <div className="card-body items-center text-center gap-2 py-2!">
          <h2 className="text-xl sm:text-2xl font-semibold text-base-content">
            {boardTitle || "Board"}
          </h2>
          <p className="text-sm sm:text-base text-base-content/70">
            You don't have access to this board
          </p>

          {requestSent ? (
            <div className="flex items-center gap-2 my-2! text-sm sm:text-base text-base-content/80">
              <span className="loading loading-spinner loading-sm text-primary"></span>
              Request pending. Waiting for owner approval...
            </div>
          ) : (
            <button
              onClick={handleRequestAccess}
              className="btn btn-primary w-full sm:w-auto m-3! px-2! rounded-full"
            >
              Request Access
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
