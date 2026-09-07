import { useState, useEffect } from "react";
import { notify } from "../../utils/toast.jsx";
import api from "../../services/api.js";
import { X } from "lucide-react";

export default function CollabModal({ boardId, onClose }) {
  const [copied, setCopied] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const inviteLink = `${window.location.origin}/board/${boardId}`;

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/boards/${boardId}/collaborators`);
        setCollaborators(res.data.data.collaborators || []);
      } catch (err) {
        console.log(`${err}`)
        // owner-only route — agar user owner nahi hai toh silently ignore karo
        setCollaborators([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [boardId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      notify.error(`copy failed ${err}`);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    try {
      await api.post(`/boards/${boardId}/remove-collaborator`, { userId });
      setCollaborators((prev) => prev.filter((c) => c._id !== userId));
      notify.success("Collaborator removed");
    } catch (err) {
      notify.error(`Failed to remove: ${err}`);
    } finally {
      setRemovingId(null);
    }
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-base-100 rounded-xl p-4! w-[90vw] max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2!">Collaborate</h3>
        <p className="mb-3!">Share this link to invite others:</p>

        <div className="flex gap-1">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="invite-link-input input input-bordered flex-1 p-2!"
          />
          <button
            onClick={handleCopy}
            className="btn btn-primary px-2! rounded-xl"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="mt-4! border-t border-base-300 pt-3!">
          <p className="text-sm font-medium text-base-content/70 mb-2!">
            People with access
          </p>

          {loadingList ? (
            <div className="flex justify-center py-3!">
              <span className="loading loading-spinner loading-sm" />
            </div>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-base-content/50 py-2!">
              No collaborators yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2! max-h-48 overflow-y-auto">
              {collaborators.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center gap-2! rounded-lg bg-base-200/60 p-2!"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-base-content">
                      {c.name}
                    </p>
                    <p className="truncate text-xs text-base-content/50">
                      {c.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(c._id)}
                    disabled={removingId === c._id}
                    aria-label={`Remove ${c.name}`}
                    className="btn btn-circle btn-xs bg-error/10 text-error border-none hover:bg-error/20 disabled:opacity-50 shrink-0"
                  >
                    {removingId === c._id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn btn-ghost mt-3! px-2! rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
}