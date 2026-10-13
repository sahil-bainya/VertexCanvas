import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function UserBoardsList({ boards, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-8!">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <p className="text-sm text-base-content/50 text-center py-6!">
        No boards yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {boards.map((b) => (
        <div
          key={b._id}
          className="card bg-base-200 p-3! hover:bg-base-300 transition-colors cursor-pointer"
          onClick={() => navigate(`/board/${b._id}`)}
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {b.title || "Untitled Board"}
              </p>
              <p className="mt-1! text-xs text-base-content/50">
                {new Date(b.createdAt).toLocaleDateString()} ·{" "}
                {b.collaborators?.length || 0} collaborators
              </p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-base-content/40 shrink-0 ml-2" />
          </div>
        </div>
      ))}
    </div>
  );
}