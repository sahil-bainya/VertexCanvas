import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/adminService.js";
import { notify } from "../../utils/toast.jsx";

export function useAdminActions({ boards, reload, setSelectedUser, selectedUser }) {
  const navigate = useNavigate();
  const [userBoards, setUserBoards] = useState([]);
  const [userBoardsLoading, setUserBoardsLoading] = useState(false);

  const handleDeleteUser = async (e, userId, name) => {
    e.stopPropagation();
    if (!confirm(`Delete user "${name}" and all their boards?`)) return;
    try {
      await adminApi.deleteUser(userId);
      notify.success("User deleted");
      if (selectedUser?._id === userId) setSelectedUser(null);
      reload();
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
      reload();
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

  return {
    userBoards,
    userBoardsLoading,
    handleDeleteUser,
    handleDeleteBoard,
    handleBoardClick,
    handleUserClick,
  };
}