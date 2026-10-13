import { Trash2, ExternalLink } from "lucide-react";

export default function UsersTab({ users, boards, onUserClick, onDeleteUser }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300">
      <table className="table">
        <thead>
          <tr className="bg-base-200">
            <th>Name</th>
            <th>Email</th>
            <th>Boards</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const ownedCount = boards.filter(
              (b) => b.owner?._id === u._id || b.owner === u._id,
            ).length;
            return (
              <tr
                key={u._id}
                onClick={() => onUserClick(u)}
                className="cursor-pointer hover:bg-base-200/50 transition-colors"
              >
                <td className="font-medium">
                  <div className="flex items-center gap-2">
                    {u.name}
                    <ExternalLink className="h-3 w-3 text-base-content/40" />
                  </div>
                </td>
                <td className="text-base-content/70">{u.email}</td>
                <td>
                  <span className="badge badge-ghost">{ownedCount}</span>
                </td>
                <td className="text-sm text-base-content/60">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button
                    onClick={(e) => onDeleteUser(e, u._id, u.name)}
                    className="btn btn-xs btn-error btn-outline"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}