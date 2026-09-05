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
    <div>
      <h2>{boardTitle || "Board"}</h2>
      <p>You don't have access to this board</p>

      {requestSent ? (
        <p>Request pending. Waiting for owner approval...</p>
      ) : (
        <button onClick={handleRequestAccess}>Request Access</button>
      )}
    </div>
  );
}
