import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../services/adminService.js";
import { notify } from "../../utils/toast.jsx";

export function useAdminData(user) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return { stats, users, boards, loading, reload: loadData };
}