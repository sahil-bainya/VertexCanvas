import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import {
  AdminHeader,
  UserDetailDrawer,
  UsersTab,
  VisitsTab,
  AdminTabs,
  BoardsTab,
  OverviewTab,
} from "../components/Admin";

import { useAdminData } from "../Hooks/admin/useAdminData.js";
import { useAdminActions } from "../Hooks/admin/useAdminActions.js";
import { useVisits } from "../Hooks/admin/useVisits.js";

export default function AdminPage() {
  const user = useSelector((state) => state.auth.user);
  const [tab, setTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState(null);

  const { stats, users, boards, loading, reload } = useAdminData(user);
  const { visits, visitStats, visitsLoading } = useVisits(tab === "visits");

  const {
    userBoards,
    userBoardsLoading,
    handleDeleteUser,
    handleDeleteBoard,
    handleBoardClick,
    handleUserClick,
  } = useAdminActions({ boards, reload, setSelectedUser, selectedUser });

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

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
        <AdminHeader />

        <AdminTabs
          tab={tab}
          setTab={setTab}
          userCount={users.length}
          boardCount={boards.length}
        />

        {tab === "overview" && <OverviewTab stats={stats} />}

        {tab === "users" && (
          <UsersTab
            users={users}
            boards={boards}
            onUserClick={handleUserClick}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {tab === "boards" && (
          <BoardsTab
            boards={boards}
            onBoardClick={handleBoardClick}
            onDeleteBoard={handleDeleteBoard}
          />
        )}

        {tab === "visits" && (
          <VisitsTab
            visits={visits}
            visitStats={visitStats}
            loading={visitsLoading}
          />
        )}
      </div>

      <UserDetailDrawer
        user={selectedUser}
        boards={userBoards}
        boardsLoading={userBoardsLoading}
        onClose={() => setSelectedUser(null)}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
