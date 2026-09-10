import { useState } from "react";
import { X, Trash, SquarePen } from "lucide-react";

export default function NotesPage({
  boardNotes,
  onDelete,
  addNotes,
  setNotesShowing,
  updateNote,
}) {
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [editingNote, seteditingNote] = useState(null);
  const handleAddNote = async () => {
    if (!note.trim()) return;
    setAdded(true);

    if (editingNote) {
      await updateNote(editingNote, note);
      seteditingNote(null);
    } else {
      const newNote = {
        id: crypto.randomUUID(),
        text: note,
        source: "manual",
        createdAt: new Date().toISOString(),
      };
      await addNotes(newNote);
    }

    setNote("");
    setTimeout(() => setAdded(false), 3000);
  };
  return (
    <div className="w-full flex flex-col gap-3 p-4! bg-base-100 h-screen">
      <div
        className="flex justify-between items-center"
        onClick={() => {
          if (editingNote) {
            seteditingNote(null);
            setNote("");
          }
        }}
      >
        <h2 className="text-xl font-bold">Notes</h2>
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={() => setNotesShowing(false)}
        >
          <X size={18} />
        </button>
      </div>
      <div className="divider " />

      {boardNotes.length === 0 && (
        <p className="text-sm text-base-content/50 text-center py-8">
          No notes yet — AI suggestions and manual notes will appear here.
        </p>
      )}

      <div
        className="flex flex-col gap-2 overflow-y-auto flex-1"
        onClick={() => {
          if (editingNote) {
            seteditingNote(null);
            setNote("");
          }
        }}
      >
        {boardNotes.map((n) => (
          <div
            key={n.id}
            className={`card bg-base-200 shadow-sm p-3! ${editingNote === n.id && "border border-primary"}`}
          >
            {n.source === "AI" && (
              <div className="badge badge-soft badge-info self-start mb-1! px-1! text-xs">
                AI generated
              </div>
            )}
            <p style={{ whiteSpace: "pre-wrap" }} className="text-md">
              {n.text}
            </p>
            <div className="flex items-end justify-end">
              <button
                className="btn btn-square btn-sm btn-ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  if (editingNote === n.id) {
                    seteditingNote(null);
                    setNote("");
                  } else {
                    setNote(n.text);
                    seteditingNote(n.id);
                  }
                }}
              >
                {editingNote === n.id ? (
                  <X size={14} className="text-base-600" />
                ) : (
                  <SquarePen size={14} className="text-base-600" />
                )}
              </button>
              <button
                className="btn btn-square btn-sm btn-ghost"
                onClick={() => onDelete(n.id)}
              >
                <Trash size={14} className="text-error" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex flex-col gap-2 mt-2 "
        onClick={(e) => e.stopPropagation()}
      >
        <textarea
          className="textarea textarea-bordered text-sm p-1! resize-none w-full"
          placeholder="Type your note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          className="btn btn-soft btn-success btn-sm self-end px-2! mb-2! mr-2! rounded-2xl"
          onClick={handleAddNote}
        >
          {added ? "Note added!" : editingNote ? "Update Note" : " + Add Note"}
        </button>
      </div>
    </div>
  );
}
