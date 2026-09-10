import { X } from "lucide-react";

export default function CloseBtn({ onClick, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={`${colorClass} rounded p-1! transition-colors shrink-0 -mr-1! -mt-1!`}
    >
      <X size={14} />
    </button>
  );
}
