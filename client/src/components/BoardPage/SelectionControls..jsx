const COLORS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];
import { FaGripLines, FaCaretDown } from "react-icons/fa";
import { Ban, Circle, Type } from "lucide-react";
import { IoDocumentAttachOutline } from "react-icons/io5";
import "./Toolbar.css";

export default function SelectionControls({
  shapes,
  selectedId,
  setShapes,
  saveHistory,
  setContextShape,
  tool,
  pencilColor,
  setPencilColor,
  pencilStrokeWidth,
  setPencilStrokeWidth,
  addLabel,
  updateColorEmiter,
}) {
  const selectedShape = shapes.find((s) => s.id === selectedId);
  if (tool === "freehand" && !selectedShape) {
    return (
      <div className="flex items-center gap-3 bg-base-100 border border-primary/40 rounded-md p-2!">
        <label
          htmlFor="pencil-color-picker"
          className="flex items-center gap-1 cursor-pointer"
        >
          <div
            className="w-6 h-6 rounded-full overflow-hidden border border-base-300"
            style={{ backgroundColor: pencilColor }}
          >
            <input
              id="pencil-color-picker"
              type="color"
              value={pencilColor}
              onChange={(e) => setPencilColor(e.target.value)}
              className="opacity-0 w-0 h-0"
            />
          </div>
          <FaCaretDown size={10} className="text-base-content/40" />
        </label>

        <div className="flex items-center gap-1">
          {[
            { value: 2, size: "w-2 h-2" },
            { value: 5, size: "w-3.5 h-3.5" },
            { value: 9, size: "w-5 h-5" },
          ].map(({ value, size }) => (
            <button
              key={value}
              onClick={() => setPencilStrokeWidth(value)}
              className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all ${
                pencilStrokeWidth === value
                  ? "bg-base-content/15"
                  : "hover:bg-base-content/10"
              }`}
            >
              <div
                className={`${size} rounded-full ${
                  pencilStrokeWidth === value
                    ? "bg-base-content"
                    : "bg-base-content/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }
  if (!selectedShape) return null;

  const isText = selectedShape.type === "text";
  const isArrow = selectedShape.type === "arrow";

  const updateColor = (key, value) => {
    saveHistory();
    setShapes(
      shapes.map((s) => (s.id === selectedId ? { ...s, [key]: value } : s)),
    );
    updateColorEmiter(selectedId, key, value);
  };

  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  };

  const getOpacity = (color) => {
    if (!color) return 1;
    if (color.startsWith("rgba")) {
      const match = color.match(/[\d.]+/g);
      return match ? parseFloat(match[3]) : 1;
    }
    return 1;
  };

  const getHex = (color) => {
    if (!color) return "#ffffff";
    if (color.startsWith("rgba")) {
      const match = color.match(/[\d.]+/g);
      if (!match) return "#ffffff";
      const r = parseInt(match[0]).toString(16).padStart(2, "0");
      const g = parseInt(match[1]).toString(16).padStart(2, "0");
      const b = parseInt(match[2]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
    return color;
  };

  const updateText = (value) => {
    saveHistory();
    setShapes(
      shapes.map((s) => (s.id === selectedId ? { ...s, text: value } : s)),
    );
    addLabel(selectedId, value);
  };

  const fillOpacity = getOpacity(selectedShape.fill);
  const fillHex = getHex(selectedShape.fill);
  const strokeHex = getHex(selectedShape.stroke);

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <ul className="menu menu-vertical lg:menu-horizontal bg-base-100  p-1.5! border border-primary/40 gap-2 rounded-md">
          {isText && (
            <li>
              <div className="dropdown dropdown-top">
                <div
                  className="tooltip p-2! flex justify-center items-center gap-1"
                  data-tip="Color"
                  tabIndex={0}
                >
                  {selectedShape ? (
                    <Circle fill={fillHex} />
                  ) : (
                    <Ban size={18} />
                  )}
                  <FaCaretDown size={10} />
                </div>
                <ul
                  tabIndex="-1"
                  className="dropdown-content  bg-base-100 rounded-md z-1 w-auto p-2! shadow-sm mb-5! border border-primary/40!"
                >
                  <li>
                    <div className="flex items-center gap-1 w-auto flex-wrap">
                      <span className="text-xs text-base-content/60">Fill</span>
                      <div className="flex gap-1">
                        <div className="flex flex-col gap-1">
                          {[
                            COLORS.slice(0, Math.ceil(COLORS.length / 2)),
                            COLORS.slice(Math.ceil(COLORS.length / 2)),
                          ].map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                              {row.map((color) => (
                                <button
                                  key={color}
                                  onClick={() =>
                                    updateColor(
                                      "fill",
                                      hexToRgba(color, fillOpacity),
                                    )
                                  }
                                  style={{ background: color }}
                                  className={`w-5 h-5 rounded-sm border ${
                                    fillHex === color
                                      ? "border-primary border-2"
                                      : "border-base-300"
                                  }`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                        <input
                          id="fill-color-picker"
                          type="color"
                          value={fillHex}
                          onChange={(e) => updateColor("fill", e.target.value)}
                          className="hidden "
                        />

                        <label
                          htmlFor="fill-color-picker"
                          className="cursor-pointer"
                        >
                          <div className="grid grid-cols-2 w-5 h-5 rounded-sm overflow-hidden">
                            <div className="bg-orange-500" />
                            <div className="bg-blue-500" />
                            <div className="bg-green-500" />
                            <div className="bg-purple-500" />
                          </div>
                        </label>
                      </div>

                      {/* Opacity */}
                      <span className="text-xs text-base-content/60">
                        Opacity
                      </span>
                      <div className="flex items-center gap-1 ml-1">
                        <span className="text-xs text-base-content/60">
                          {Math.round(fillOpacity * 100)}%
                        </span>
                        <input
                          id="rangeopacity"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={fillOpacity}
                          onChange={(e) =>
                            updateColor(
                              "fill",
                              hexToRgba(fillHex, parseFloat(e.target.value)),
                            )
                          }
                          className="range range-xs"
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {isArrow && (
            <li>
              <div className="dropdown dropdown-top">
                <div
                  className="tooltip p-2! flex justify-center items-center gap-1"
                  data-tip="Stroke"
                  tabIndex={0}
                >
                  <FaGripLines size={18} />
                  <FaCaretDown size={10} />
                </div>
                <ul
                  tabIndex="-1"
                  className="dropdown-content menu bg-base-100 rounded-md z-1 w-auto p-2! shadow-sm mb-5! border border-primary/40! "
                >
                  <li>
                    <div className="flex items-center gap-1  flex-col">
                      <span className="text-xs text-base-content/60">
                        Stroke
                      </span>
                      <div className="flex gap-1">
                        <div className="flex flex-col gap-1">
                          {[
                            COLORS.slice(0, Math.ceil(COLORS.length / 2)),
                            COLORS.slice(Math.ceil(COLORS.length / 2)),
                          ].map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                              {row.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updateColor("stroke", color)}
                                  style={{ background: color }}
                                  className={`w-5 h-5 rounded-sm border ${
                                    strokeHex === color
                                      ? "border-primary border-2"
                                      : "border-base-300"
                                  }`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        <input
                          id="op-color-picker"
                          type="color"
                          value={strokeHex}
                          onChange={(e) =>
                            updateColor("stroke", e.target.value)
                          }
                          className="hidden"
                        />

                        <label
                          htmlFor="op-color-picker"
                          className="cursor-pointer"
                        >
                          <div className="grid grid-cols-2 w-5 h-5 rounded-sm overflow-hidden">
                            <div className="bg-orange-500" />
                            <div className="bg-blue-500" />
                            <div className="bg-green-500" />
                            <div className="bg-purple-500" />
                          </div>
                        </label>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {!isArrow && !isText && (
            <li>
              <div className="dropdown dropdown-top">
                <div
                  className="tooltip p-2! flex justify-center items-center gap-1"
                  data-tip="Color"
                  tabIndex={0}
                >
                  {selectedShape?.fill ? (
                    <Circle fill={fillHex} size={18} />
                  ) : (
                    <Ban size={18} />
                  )}
                  <FaCaretDown size={10} />
                </div>
                <ul
                  tabIndex="-1"
                  className="dropdown-content  bg-base-100 rounded-md z-1 w-auto p-2! shadow-sm mb-5! border border-primary/40!"
                >
                  <li>
                    <div className="flex items-center gap-1 w-auto flex-wrap">
                      <span className="text-xs text-base-content/60">Fill</span>
                      <div className="flex gap-1">
                        <div className="flex flex-col gap-1">
                          {[
                            COLORS.slice(0, Math.ceil(COLORS.length / 2)),
                            COLORS.slice(Math.ceil(COLORS.length / 2)),
                          ].map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                              {row.map((color) => (
                                <button
                                  key={color}
                                  onClick={() =>
                                    updateColor(
                                      "fill",
                                      hexToRgba(color, fillOpacity),
                                    )
                                  }
                                  style={{ background: color }}
                                  className={`w-5 h-5 rounded-sm border ${
                                    fillHex === color
                                      ? "border-primary border-2"
                                      : "border-base-300"
                                  }`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                        <input
                          id="fill-color-picker"
                          type="color"
                          value={fillHex}
                          onChange={(e) => updateColor("fill", e.target.value)}
                          className="hidden "
                        />

                        <label
                          htmlFor="fill-color-picker"
                          className="cursor-pointer"
                        >
                          <div className="grid grid-cols-2 w-5 h-5 rounded-sm overflow-hidden">
                            <div className="bg-orange-500" />
                            <div className="bg-blue-500" />
                            <div className="bg-green-500" />
                            <div className="bg-purple-500" />
                          </div>
                        </label>
                      </div>

                      <span className="text-xs text-base-content/60">
                        Opacity
                      </span>
                      <div className="flex items-center gap-1 ml-1">
                        <span className="text-xs text-base-content/60">
                          {Math.round(fillOpacity * 100)}%
                        </span>
                        <input
                          id="rangeopacity"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={fillOpacity}
                          onChange={(e) =>
                            updateColor(
                              "fill",
                              hexToRgba(fillHex, parseFloat(e.target.value)),
                            )
                          }
                          className="range range-xs"
                        />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {!isArrow && !isText && (
            <li>
              <div className="dropdown dropdown-top">
                <div
                  className="tooltip p-2! flex justify-center items-center gap-1"
                  data-tip="Stroke"
                  tabIndex={0}
                >
                  <FaGripLines size={18} />
                  <FaCaretDown size={10} />
                </div>
                <ul
                  tabIndex="-1"
                  className="dropdown-content menu bg-base-100 rounded-md z-1 w-auto p-2! shadow-sm mb-5! border border-primary/40! "
                >
                  <li>
                    <div className="flex items-center gap-1  flex-col">
                      <span className="text-xs text-base-content/60">
                        Stroke
                      </span>
                      <div className="flex gap-1">
                        <div className="flex flex-col gap-1">
                          {[
                            COLORS.slice(0, Math.ceil(COLORS.length / 2)),
                            COLORS.slice(Math.ceil(COLORS.length / 2)),
                          ].map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                              {row.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updateColor("stroke", color)}
                                  style={{ background: color }}
                                  className={`w-5 h-5 rounded-sm border ${
                                    strokeHex === color
                                      ? "border-primary border-2"
                                      : "border-base-300"
                                  }`}
                                />
                              ))}
                            </div>
                          ))}
                        </div>

                        <input
                          id="op-color-picker"
                          type="color"
                          value={strokeHex}
                          onChange={(e) =>
                            updateColor("stroke", e.target.value)
                          }
                          className="hidden"
                        />

                        <label
                          htmlFor="op-color-picker"
                          className="cursor-pointer"
                        >
                          <div className="grid grid-cols-2 w-5 h-5 rounded-sm overflow-hidden">
                            <div className="bg-orange-500" />
                            <div className="bg-blue-500" />
                            <div className="bg-green-500" />
                            <div className="bg-purple-500" />
                          </div>
                        </label>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {!isText && (
            <li>
              <div className="dropdown dropdown-top">
                <div
                  className="tooltip p-2! flex justify-center items-center gap-1"
                  data-tip="Add Label"
                  tabIndex={0}
                >
                  <Type size={18} />
                  <FaCaretDown size={10} />
                </div>
                <ul
                  tabIndex="-1"
                  className="dropdown-content menu bg-base-100 rounded-sm z-1 w-auto p-2! shadow-sm mb-5! border border-primary/40"
                >
                  <li>
                    <div className="flex items-center ">
                      <input
                        type="text"
                        defaultValue={selectedShape.text || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateText(e.target.value);
                          }
                        }}
                        placeholder="Add label..."
                        className="input rounded-sm input-sm w-40 p-2! text-md"
                      />
                    </div>
                  </li>
                </ul>
              </div>
            </li>
          )}
          <li>
            <div className="dropdown dropdown-top">
              <div
                className="tooltip p-2! flex justify-center items-center gap-1"
                data-tip="Attach Notes, Code & Links"
                onClick={() => setContextShape(selectedShape)}
              >
                <IoDocumentAttachOutline size={18} />
                <FaCaretDown size={10} />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
