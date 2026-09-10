import { Undo2, Redo2, Grid3x2 } from "lucide-react";
import { useSelector } from "react-redux";
import "./BoardStyle.css";
export default function CanvasControls({
  zoomIn,
  zoomOut,
  resetZoom,
  undo,
  redo,
  grid,
  setGrid,
}) {
  const theme = useSelector((state) => state.theme.mode);
  return (
    <div className="m-3!">
      <div className="flex flex-row flex-wrap gap-2 ">
        <ul
          className={`menu menu-horizontal bg-base-300 rounded-md mt-6 ${theme === "dark" && "border border-primary/40"}`}
        >
          <li>
            <a className="tooltip  h-full" data-tip="Undo">
              <button className="p-2!" onClick={() => undo()}>
                <Undo2 size={18} />
              </button>
            </a>
          </li>
          <li>
            <a className="tooltip  h-full" data-tip="Redo">
              <button className="p-2!" onClick={() => redo()}>
                <Redo2 size={18} />
              </button>
            </a>
          </li>
        </ul>

        <ul
          className={`menu menu-horizontal bg-base-300 rounded-md mt-6 ${theme === "dark" && "border border-primary/40"}`}
        >
          <li>
            <a>
              <button className=" p-2!" onClick={() => zoomIn()}>
                +
              </button>
            </a>
          </li>
          <li>
            <a
              className="tooltip  hover:bg-transparent active:bg-transparent"
              data-tip="Reset zoom"
            >
              <button className=" p-2!" onClick={() => resetZoom()}>
                100%
              </button>
            </a>
          </li>
          <li>
            <a>
              <button className=" px-2.5! py-2!" onClick={() => zoomOut()}>
                -
              </button>
            </a>
          </li>
        </ul>

        <div
          data-tip="Grid"
          className={`tooltip grid-btn label bg-base-300 px-1! rounded-md ${theme === "dark" && "border border-primary/40"}`}
        >
          <input
            id="grid-toggle"
            type="checkbox"
            defaultChecked={grid}
            onChange={() => setGrid((prev) => !prev)}
          />
          <label htmlFor="grid-toggle">
            <Grid3x2 size={20} />
          </label>
        </div>
      </div>
    </div>
  );
}
