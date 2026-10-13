import { Trash2, ExternalLink } from "lucide-react";

export default function BoardsTab({ boards, onBoardClick, onDeleteBoard }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300">
      <table className="table">
        <thead>
          <tr className="bg-base-200">
            <th>Title</th>
            <th>Owner</th>
            <th>Collaborators</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((b) => (
            <tr
              key={b._id}
              className="cursor-pointer hover:bg-base-200/50 transition-colors"
              onClick={(e) => onBoardClick(e, b._id)}
            >
              <td className="font-medium">
                <div className="flex items-center gap-2">
                  {b.title || "Untitled"}
                  <ExternalLink className="h-3 w-3 text-base-content/40" />
                </div>
              </td>
              <td className="text-base-content/70">
                {b.owner?.name || b.ownerName || "—"}
              </td>
              <td>{b.collaborators?.length || 0}</td>
              <td className="text-sm text-base-content/60">
                {new Date(b.createdAt).toLocaleDateString()}
              </td>
              <td>
                <button
                  onClick={(e) => onDeleteBoard(e, b._id, b.title)}
                  className="btn btn-xs btn-error btn-outline"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}