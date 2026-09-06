import { useEffect } from "react";
import api from "../../services/api.js";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Card from "./Card.jsx";
import {
  addBoard,
  removeBoard,
  setBoards,
  updateBoard,
} from "../../store/boardSlice.js";
import { notify } from "../../utils/toast.jsx";
import { useGlobalSocketContext } from "../../globalSocket/SocketContext.js";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const boards = useSelector((state) => state.board.boards);
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const socketRef = useGlobalSocketContext();
  useEffect(() => {
    if (!socketRef.current) return;

    const handleAccessRequested = ({ boardId, requesterId, requesterName }) => {
      // toast/modal-dikhao "X wants to join board Y"
      notify.info(`${requesterName} requested access`);
    };

    socketRef.current.on("access-requested", handleAccessRequested);

    return () => {
      socketRef.current.off("access-requested", handleAccessRequested);
    };
  }, [socketRef]);


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const boardResponse = await api.get("/boards");
        dispatch(setBoards(boardResponse.data.data.boards));
      } catch (err) {
        notify.error(
          err?.response?.data?.message ||
            "Something went wrong while fetching details",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [dispatch]);

  const handleCreate = async () => {
    try {
      const res = await api.post("/boards", { title: "Untitled Board" });
      dispatch(addBoard(res.data.data.board));
      navigate(`/board/${res.data.data.board._id}`);
    } catch (err) {
      notify.error(
        err?.response?.data?.message ||
          "Something went wrong while creating board",
      );
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // <-- to stop the event bubbling , otherwise it goes to the parent also
    try {
      await api.delete(`/boards/${id}`);
      dispatch(removeBoard(id));
      notify.success("Board deleted!")
    } catch (err) {
      notify.error(
        err?.response?.data?.message ||
          "Something went wrong while deleting board",
      );
    }
  };

  const saveTitle = async (id) => {
    try {
      await api.patch(`/boards/${id}`, {
        title: editingTitle || "Untitled Board",
      });
      dispatch(updateBoard({ id, title: editingTitle }));
    } catch (err) {
      notify.error(err?.response?.data?.message || "Title update failed");
    } finally {
      setEditingBoardId(null);
    }
  };
  if (loading) return <div>Loading...</div>;
  return (
    <div className="px-4! py-4!">
      <div className="flex justify-end px-6! py-4! ">
        <button className="btn btn-soft btn-info px-2!" onClick={handleCreate}>
          Create New Board
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Card
              key={board._id}
              board={board}
              isEditing={editingBoardId === board._id}
              editingTitle={editingTitle}
              onNavigate={() => navigate(`/board/${board._id}`)}
              onEditStart={() => {
                setEditingTitle(board.title);
                setEditingBoardId(board._id);
              }}
              onEditChange={(val) => setEditingTitle(val)}
              onEditSave={() => saveTitle(board._id)}
              onEditCancel={() => setEditingBoardId(null)}
              onDelete={(e) => handleDelete(e, board._id)}
            />
          ))
        ) : (
          <p>Koi board nahi — naya banao</p>
        )}
      </div>
    </div>
  );
}
