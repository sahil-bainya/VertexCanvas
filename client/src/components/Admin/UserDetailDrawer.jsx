import { X, Mail, Calendar, Layout, Trash2 } from "lucide-react";
import UserBoardsList from "./UserBoardsList.jsx";

export default function UserDetailDrawer({
  user,
  boards,
  boardsLoading,
  onClose,
  onDelete,
}) {
  if (!user) return null;

  const initials = user.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-base-100 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6! z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-base-content/60">User Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost btn-circle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6! space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-base-content/50" />
              <span className="text-base-content/70">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-base-content/50" />
              <span className="text-base-content/70">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Layout className="h-4 w-4 text-base-content/50" />
              <span className="text-base-content/70">
                {boards.length} board{boards.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-3! text-sm font-medium text-base-content/60 uppercase tracking-wide">
              Boards
            </h3>
            <UserBoardsList boards={boards} loading={boardsLoading} />
          </div>

          <div className="pt-4! border-t border-base-300">
            <button
              onClick={(e) => onDelete(e, user._id, user.name)}
              className="btn btn-error btn-outline btn-sm w-full"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete User & All Boards
            </button>
          </div>
        </div>
      </div>
    </>
  );
}