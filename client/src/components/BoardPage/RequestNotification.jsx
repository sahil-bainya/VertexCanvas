import { useState } from "react";
import api from "../../services/api.js";
import { notify } from "../../utils/toast.jsx";
import Button from "../Button.jsx";
export default function RequestNotification({ request, onHandled }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post(`/boards/${request.boardId}/accept-request`, {
        userId: request.userId,
      });
      notify.success("Access granted");
      onHandled(request.userId);
    } catch (err) {
      notify.error(`Failed to accept :${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await api.post(`/boards/${request.boardId}/reject-request`, {
        userId: request.userId,
      });
      notify.success("Request rejected");
      onHandled(request.userId);
    } catch (err) {
      notify.error(`Failed to reject :${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 p-4! rounded-lg shadow-lg border border-primary-100">
      <p className="font-medium text-base-content">
        {request.userName} wants to join
      </p>
      <div className="flex gap-2 mt-2!">
        <Button children={"Accept"} loading={loading} onClick={handleAccept} buttonType={"btn-success"}/>
        <Button children={"Reject"} loading={loading} onClick={handleReject} buttonType={"btn-error"}/>
        <button
          onClick={handleReject}
          disabled={loading}
          className="btn btn-soft btn-error"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
