import { EllipsisVertical, Pencil, Trash } from "lucide-react";
function timeAgo(dateString) {
  const updatedAt = new Date(dateString);
  const now = new Date();
  const diffInMs = now - updatedAt;

  const secs = Math.floor(diffInMs / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (secs < 60) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Card({
  board,
  isEditing,
  editingTitle,
  onNavigate,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onDelete,
}) {
  return (
    <div
      className="card bg-base-100 image-full w-full shadow-sm cursor-pointer hover:shadow-xl  transition-all duration-300 group"
      onClick={onNavigate}
    >
      <figure>
        <img
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt={board.title}
          className="brightness-90 group-hover:brightness-80 transition-all duration-300"
        />
      </figure>

      <div className="card-body p-4! flex flex-col">
        {isEditing ? (
          <input
            autoFocus
            className="bg-white/20 backdrop-blur-sm border-2 border-white/60 rounded-lg text-gray-800 card-title outline-none w-full px-2! py-1 placeholder-white/50 focus:border-gray-500 transition-colors"
            value={editingTitle}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onEditChange(e.target.value)}
            onBlur={onEditSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") onEditSave();
              if (e.key === "Escape") onEditCancel();
            }}
          />
        ) : (
          <h2 className="card-title text-gray-800">{board.title}</h2>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Dates + Actions - neeche */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm opacity-70 text-gray-700">
              CREATED :&nbsp;{new Date(board.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm opacity-70 text-gray-700">
              EDITED :&nbsp;{timeAgo(board.updatedAt)}
            </p>
          </div>

          <div
            className="dropdown dropdown-top dropdown-end"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
              className="p-2! rounded-full hover:bg-white/30 transition-colors cursor-pointer"
            >
              <EllipsisVertical className="text-gray-700" size={20} />
            </div>

            {/* Menu */}
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-gray-900/80 backdrop-blur-sm rounded-box z-1 w-auto p-2! shadow-sm border-white/20 border"
              onClick={(e) => e.stopPropagation()}
            >
              <li>
                <button
                  className="text-white hover:bg-white/20 flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStart();
                  }}
                >
                  <Pencil size={18} /> Rename
                </button>
              </li>
              <li>
                <button
                  className="text-red-400 hover:bg-white/20 flex items-center gap-2"
                  onClick={onDelete}
                >
                  <Trash size={18} /> Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
