import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import RequestNotification from "./RequestNotification.jsx";

export default function PendingRequestsButton({
  pendingRequests,
  onHandled,
  style,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((prev) => !prev)} className={style}>
        <div className="indicator">
          <Bell size={18} />
          {pendingRequests.length > 0 && (
            <span className="badge badge-sm badge-error indicator-item px-1.5!">
              {pendingRequests.length}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2! w-80 bg-base-100 shadow-xl rounded-box border border-base-300 p-2! max-h-96 overflow-y-auto flex flex-col gap-2">
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-base-content/60 text-center py-4">
              No pending requests
            </p>
          ) : (
            pendingRequests.map((req) => (
              <RequestNotification
                key={req.userId}
                request={req}
                onHandled={onHandled}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
