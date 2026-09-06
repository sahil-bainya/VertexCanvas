import { useState } from "react";
import { notify } from "../../utils/toast.jsx";
export default function CollabModal({ boardId, onClose }) {
  const [copied, setCopied] = useState(false);
  console.log("gfdgfd");

  const inviteLink = `${window.location.origin}/board/${boardId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      notify.error(`copy failed ${err}`);
    }
  };

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

        <div className="flex gap-1 ">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="invite-link-input input input-bordered flex-1 p-2!"
          />
          <button onClick={handleCopy} className="btn btn-primary px-2! rounded-xl">
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <button onClick={onClose} className="btn btn-ghost mt-2! px-2! rounded-xl">
          Close
        </button>
      </div>
    </div>
  );
}
