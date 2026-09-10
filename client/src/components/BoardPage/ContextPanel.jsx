import { useState } from "react";
import { Trash, SquareArrowRightEnter, X } from "lucide-react";
import { useSelector } from "react-redux";
import CodeEditor from "@uiw/react-textarea-code-editor";

export default function ContextPanel({ shape, onClose, onSave }) {
  const theme = useSelector((state) => state.theme.mode);
  const [notes, setNotes] = useState(shape.context?.notes || "");
  const [links, setLinks] = useState(shape.context?.links || []);
  const [code, setCode] = useState(shape.context?.code || "");
  const [newLink, setNewLink] = useState("");
  const HandleClose = () => {
    onSave({ ...shape, context: { notes, links, code } });
    onClose();
  };
  const removeLink = (id) => {
    const updatedLinks = links.filter((link) => link.id !== id);
    setLinks(updatedLinks);
  };
  const inserLink = () => {
    if (!newLink.trim()) return;
    setLinks([...links, { id: crypto.randomUUID(), url: newLink }]);
    setNewLink("");
  };
  return (
    <div>
      <div className="tabs tabs-box w-full gap-3 p-3! bg-base-300 border border-primary/50 ">
        <input
          type="radio"
          name="my_tabs_6"
          className="tab px-3! text-lg font-bold rounded-full"
          aria-label="Notes"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-2! h-64 ">
          <textarea
            name="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write the notes here..."
            className="w-full h-full focus:outline-none outline-none"
          />
        </div>

        <input
          type="radio"
          name="my_tabs_6"
          className="tab px-3! text-lg font-bold rounded-full"
          aria-label="Link"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 p-2! h-64 overflow-y-auto">
          <ul className="list bg-base-100 rounded-box shadow-md gap-2!">
            {links.map((link) => (
              <li
                key={link.id}
                className="list-row border border-primary/40 px-2! flex items-center justify-between rounded-md bg-base-300"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="link text-blue-500 link-hover text-[15px]"
                >
                  {link.url}
                </a>
                <br />
                <button
                  onClick={() => removeLink(link.id)}
                  className="btn btn-square btn-ghost"
                >
                  <Trash size={18} color="#FCA5A5" />
                </button>
              </li>
            ))}
            <li className="list-row border border-primary/20 p-2! flex items-center justify-between rounded-md bg-base-300">
              <input
                type="text"
                placeholder="paste link here"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className="text-[15px] outline-none focus:outline-none w-auto"
              />
              <button onClick={inserLink} className=" flex items-center gap-2">
                <SquareArrowRightEnter size={18} />
                Insert
              </button>
            </li>
          </ul>
        </div>

        <input
          type="radio"
          name="my_tabs_6"
          className="tab px-3! text-lg font-bold rounded-full"
          aria-label="Code"
        />
        <div className="tab-content bg-base-100 border-base-300 rounded-md h-64 overflow-y-auto">
          <div>
            <label htmlFor="Code"></label>
            <CodeEditor
              value={code}
              language="javascript"
              placeholder="Write code here"
              onChange={(e) => setCode(e.target.value)}
              data-color-mode={
                theme === "light" || theme === "autumn" ? "light" : "dark"
              }
              className="h-full font-mono text-lg! rounded-md"
            />
          </div>
        </div>
        <button
          onClick={HandleClose}
          aria-label="Close"
          className="btn btn-sm btn-ghost btn-circle ml-auto!"
        >
          <X size={30} />
        </button>
      </div>
    </div>
  );
}
