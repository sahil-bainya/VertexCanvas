import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  LayoutGrid,
  Trash2,
  Shield,
  ExternalLink,
  X,
  Mail,
  Calendar,
  Layout,
} from "lucide-react";
import { adminApi } from "../../services/adminService.js";
import { notify } from "../../utils/toast.jsx";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userBoards, setUserBoards] = useState([]);
  const [userBoardsLoading, setUserBoardsLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes, boardsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getBoards(),
      ]);
      setStats(statsRes.data.data.stats);
      setUsers(usersRes.data.data.users);
      setBoards(boardsRes.data.data.boards);
    } catch (err) {
      console.error("Admin load error:", err);
      notify.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    let ignore = false;
    (async () => {
      try {
        const [statsRes, usersRes, boardsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers(),
          adminApi.getBoards(),
        ]);
        if (!ignore) {
          setStats(statsRes.data.data.stats);
          setUsers(usersRes.data.data.users);
          setBoards(boardsRes.data.data.boards);
        }
      } catch (err) {
        if (!ignore) notify.error("Failed to load admin data");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const handleDeleteUser = async (e, userId, name) => {
    e.stopPropagation();
    if (!confirm(`Delete user "${name}" and all their boards?`)) return;
    try {
      await adminApi.deleteUser(userId);
      notify.success("User deleted");
      if (selectedUser?._id === userId) setSelectedUser(null);
      loadData();
    } catch (err) {
      notify.error(`Failed to delete user`);
    }
  };

  const handleDeleteBoard = async (e, boardId, title) => {
    e.stopPropagation();
    if (!confirm(`Delete board "${title}"?`)) return;
    try {
      await adminApi.deleteBoard(boardId);
      notify.success("Board deleted");
      loadData();
      if (selectedUser) {
        setUserBoards((prev) => prev.filter((b) => b._id !== boardId));
      }
    } catch (err) {
      notify.error("Failed to delete board");
    }
  };

  const handleBoardClick = (e, boardId) => {
    e.stopPropagation();
    navigate(`/board/${boardId}`);
  };

  const handleUserClick = (u) => {
    setSelectedUser(u);
    setUserBoardsLoading(true);
    const owned = boards.filter(
      (b) => b.owner?._id === u._id || b.owner === u._id,
    );
    setUserBoards(owned);
    setUserBoardsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-6! mt-15!">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8! flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2!">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-base-content/60">
              Manage users, boards, and platform data
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex gap-3 mb-5!">
          <button
            role="tab"
            className={`tab ${tab === "overview" ? "border-2 border-primary" : ""} btn btn-soft px-3! rounded-full`}
            onClick={() => setTab("overview")}
          >
            Overview
          </button>
          <button
            role="tab"
            className={`tab ${tab === "users" ? "border-2 border-primary" : ""} btn btn-soft px-3! rounded-full`}
            onClick={() => setTab("users")}
          >
            Users ({users.length})
          </button>
          <button
            role="tab"
            className={`tab ${tab === "boards" ? "border-2 border-primary" : ""} btn btn-soft px-3! rounded-full`}
            onClick={() => setTab("boards")}
          >
            Boards ({boards.length})
          </button>
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Total Users"
              value={stats?.totalUsers || 0}
            />
            <StatCard
              icon={<LayoutGrid className="h-5 w-5" />}
              label="Total Boards"
              value={stats?.totalBoards || 0}
            />
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="overflow-x-auto rounded-xl border border-base-300">
            <table className="table">
              <thead>
                <tr className="bg-base-200 ">
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
                      onClick={() => handleUserClick(u)}
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
                          onClick={(e) => handleDeleteUser(e, u._id, u.name)}
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
        )}

        {/* Boards */}
        {tab === "boards" && (
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
                    onClick={(e) => handleBoardClick(e, b._id)}
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
                        onClick={(e) => handleDeleteBoard(e, b._id, b.title)}
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
        )}
      </div>

      {/* User Detail Drawer */}
      {selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setSelectedUser(null)}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-base-100 shadow-2xl z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6! z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {selectedUser.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedUser.name}
                    </h2>
                    <p className="text-sm text-base-content/60">User Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
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
                  <span className="text-base-content/70">
                    {selectedUser.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-base-content/50" />
                  <span className="text-base-content/70">
                    Joined{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Layout className="h-4 w-4 text-base-content/50" />
                  <span className="text-base-content/70">
                    {userBoards.length} board
                    {userBoards.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-3! text-sm font-medium text-base-content/60 uppercase tracking-wide">
                  Boards
                </h3>

                {userBoardsLoading ? (
                  <div className="flex justify-center py-8!">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : userBoards.length === 0 ? (
                  <p className="text-sm text-base-content/50 text-center py-6!">
                    No boards yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userBoards.map((b) => (
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
                )}
              </div>

              <div className="pt-4! border-t border-base-300">
                <button
                  onClick={(e) =>
                    handleDeleteUser(e, selectedUser._id, selectedUser.name)
                  }
                  className="btn btn-error btn-outline btn-sm w-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete User & All Boards
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card border border-base-300 bg-base-200 p-6!">
      <div className="flex items-center gap-3 text-base-content/60">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-3! text-3xl font-semibold">{value}</div>
    </div>
  );
}
