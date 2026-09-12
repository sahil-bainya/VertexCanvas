import { X, Copy, Check, Code2, FilePlusCorner } from "lucide-react";
import { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";

const LANGUAGE_MAP = {
  "C++": "cpp",
  Python: "python",
  JavaScript: "javascript",
  Java: "java",
  SQL: "sql",
  "MongoDB (Mongoose)": "javascript",
  Prisma: "prisma",
  Sequelize: "javascript",
  "Node.js (Express)": "javascript",
  "Python (FastAPI)": "python",
  "Java (Spring Boot)": "java",
  "Go (Gin)": "go",
};

function getEditorLanguage(language) {
  return LANGUAGE_MAP[language] || "javascript";
}

export default function DisplayCode({
  isOpen,
  code,
  language,
  onClose,
  onAddToNotes,
}) {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleAddToNotes = async () => {
    setAdded(true);
    await onAddToNotes?.();
    setTimeout(() => setAdded(false), 3000);
  };
  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-105 bg-base-100 z-200 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4! border-b border-base-300">
        <div className="flex items-center gap-2">
          <div className="bg-secondary/10 p-2! rounded-full">
            <Code2 size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Generated Code</h3>
            <span className="text-xs text-base-content/50">{language}</span>
          </div>
        </div>
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2!">
        <CodeEditor
          value={code || ""}
          language={getEditorLanguage(language)}
          readOnly
          padding={12}
          className="rounded-lg"
          style={{
            fontSize: 13,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            minHeight: "100%",
          }}
        />
      </div>

      <div className="px-4! py-2! border-t border-base-300 flex gap-3 justify-end">
        <button
          className="btn btn-success btn-soft gap-2 px-2!"
          onClick={handleCopy}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
        <button
          className="btn btn-primary btn-soft px-2!"
          onClick={handleAddToNotes}
          disabled={added}
        >
          <FilePlusCorner size={16} />
          {added ? "Added" : "Add to Notes"}
        </button>
      </div>
    </div>
  );
}
