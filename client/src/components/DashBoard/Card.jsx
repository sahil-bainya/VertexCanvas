import { Ellipsis , Pencil, Trash } from "lucide-react";
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
   <tr
  className="hover:bg-base-200 cursor-pointer transition-colors "
  onClick={onNavigate}
>
  <td className="p-3! text-lg ">
    {isEditing ? (
      <input
        autoFocus
        className="bg-base-content/10 backdrop-blur-sm border border-base-content/30 rounded-sm px-2! py-1! placeholder-base-content/50 focus:border-base-content/50 transition-colors"
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
      <h2 className="font-semibold text-base-content">{board.title}</h2>
    )}
  </td>
  <td className="py-3! text-sm text-base-content/70">
    {new Date(board.createdAt).toLocaleDateString()}
  </td>
  <td className="py-3! text-sm text-base-content/70">{timeAgo(board.updatedAt)}</td>
  <td className="py-3!">
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-base-content/70">{board.ownerName}</span>

      <div
        className="dropdown dropdown-end dropdown-top md:dropdown-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
          className="p-2! rounded-full hover:bg-base-content/10 transition-colors cursor-pointer"
        >
          <Ellipsis  className="text-base-content/50" size={20} />
        </div>

        {/* Menu */}
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-200 rounded-box z-50 w-auto p-2! shadow-md border border-base-300 gap-1!"
          onClick={(e) => e.stopPropagation()}
        >
          <li>
            <button
              className="text-base-content hover:bg-base-content/10 flex items-center gap-2 px-3! py-1.5! rounded-md text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditStart();
              }}
            >
              <Pencil size={16} /> Rename
            </button>
          </li>
          <li>
            <button
              className="text-error hover:bg-base-content/10 flex items-center gap-2 px-3! py-1.5! rounded-md text-sm"
              onClick={onDelete}
            >
              <Trash size={16} /> Delete
            </button>
          </li>
        </ul>
      </div>
    </div>
  </td>
</tr>
  );
}
