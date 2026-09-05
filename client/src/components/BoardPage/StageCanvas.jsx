import { Stage, Layer, Transformer, Arrow, Text, Group } from "react-konva";
import { Image as KonvaImage } from "react-konva";
import { SHAPE_CONFIG } from "./shapeConfig.jsx";
import { getTextPosition } from "./canvasHelper.js";
import "./BoardStyle.css";
import useImage from "use-image";

// Helper function - user ID se consistent color generate karo
const getUserColor = (userId) => {
  const colors = [
    "#4A90E2", // Blue
    "#E24A4A", // Red
    "#4AE24A", // Green
    "#E2A64A", // Orange
    "#9B4AE2", // Purple
    "#E24A9B", // Pink
    "#4AE2D0", // Teal
    "#E2D04A", // Yellow
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export default function StageCanvas({
  stageRef,
  stageSize,
  setSelectedId,
  arrows,
  shapes,
  shapeRefs,
  updateArrowPoints,
  handleDragEnd,
  handleTransformEnd,
  transformerRef,
  selectedId,
  handleShapeClick,
  grid,
  setPendingShapeType,
  pendingShapeType,
  addShape,
  tool,
  isDrawing,
  startFreehandDraw,
  continueFreehandDraw,
  endFreehandDraw,
  handleTextDblClick,
  selectedArrowId,
  setSelectedArrowId,
  remoteCursors,
  onMouseMove,
}) {
  const [cursorImage] = useImage("https://img.icons8.com/color/48/cursor.png");

  return (
    <Stage
      id={grid ? "Canvas" : undefined}
      width={stageSize.width}
      height={stageSize.height}
      ref={stageRef}
      draggable={!pendingShapeType && tool !== "freehand" && tool !== "eraser"}
      onWheel={(e) => {
        // ← yeh add karo, ZOOM ke liye
        e.evt.preventDefault();
        const stage = stageRef.current;

        // Zoom hatao, sirf scroll karo
        const dx = e.evt.deltaX;
        const dy = e.evt.deltaY;

        stage.position({
          x: stage.x() - dx,
          y: stage.y() - dy,
        });
      }}
      onMouseDown={(e) => {
        if (pendingShapeType) {
          const pointerPos = e.target.getStage().getPointerPosition();
          const stage = e.target.getStage();
          const transform = stage.getAbsoluteTransform().copy().invert();
          const canvasPos = transform.point(pointerPos);
          addShape(pendingShapeType, canvasPos.x, canvasPos.y);
          setPendingShapeType(null);
          return;
        }

        if (tool === "freehand") {
          const stage = e.target.getStage();
          const pointerPos = stage.getPointerPosition();
          const transform = stage.getAbsoluteTransform().copy().invert();
          const canvasPos = transform.point(pointerPos);
          startFreehandDraw(canvasPos.x, canvasPos.y);
          return;
        }
        if (e.target === e.target.getStage()) {
          setSelectedId(null);
          setSelectedArrowId(null);
        }
      }}
      onMouseMove={(e) => {
        onMouseMove(e);
        if (tool === "freehand" && isDrawing) {
          const stage = e.target.getStage();
          const pointerPos = stage.getPointerPosition();
          const transform = stage.getAbsoluteTransform().copy().invert();
          const canvasPos = transform.point(pointerPos);
          continueFreehandDraw(canvasPos.x, canvasPos.y);
        }
      }}
      onMouseUp={() => {
        if (tool === "freehand" && isDrawing) {
          endFreehandDraw();
        }
      }}
      onMouseEnter={() => {
        const container = stageRef.current.container();
        if (tool === "freehand") container.style.cursor = "crosshair";
        else if (tool === "eraser") container.style.cursor = "grab";
        else if (pendingShapeType) container.style.cursor = "crosshair";
        else container.style.cursor = "default";
      }}
    >
      <Layer>
        {arrows.map((arrow) => (
          <Arrow
            key={arrow.id}
            points={arrow.points}
            stroke={
              selectedArrowId === arrow.id
                ? "#3b82f6"
                : arrow.stroke || "#000000"
            } // ← selected-hone-pe-highlight
            fill={arrow.stroke || "#000000"}
            strokeWidth={selectedArrowId === arrow.id ? 3 : 2} // ← selected-hone-pe-mota
            hitStrokeWidth={20} // ← click-area-badhao (freehand-jaisa)
            onClick={() => {
              setSelectedArrowId(arrow.id);
              setSelectedId(null);
            }} // ← naya
          />
        ))}
        {shapes.map((el) => {
          const { Component, getProps } = SHAPE_CONFIG[el.type];
          const isFreehand = el.type === "freehand"; // ← yeh-add-karo

          return (
            <>
              <Component
                key={el.id}
                draggable={!isFreehand}
                x={el.x || 0}
                y={el.y || 0}
                rotation={el.rotation || 0}
                fill={el.fill}
                stroke={el.stroke}
                hitStrokeWidth={isFreehand ? 20 : undefined}
                ref={(node) => (shapeRefs.current[el.id] = node)}
                onClick={
                  isFreehand
                    ? tool === "eraser"
                      ? (e) => handleShapeClick(e, el.id)
                      : undefined
                    : (e) => handleShapeClick(e, el.id)
                }
                onDblClick={
                  el.type === "text"
                    ? () => handleTextDblClick(el.id)
                    : undefined
                }
                onDblTap={
                  el.type === "text"
                    ? () => handleTextDblClick(el.id)
                    : undefined
                }
                onDragMove={() => updateArrowPoints(el.id)}
                onDragEnd={(e) => handleDragEnd(e, el.id)}
                onTransformEnd={() => handleTransformEnd(el.id)}
                listening={isFreehand ? tool === "eraser" : true}
                {...getProps(el)}
              />

              {el.type !== "text" && el.text && (
                <Text
                  key={el.id + "-label"}
                  {...getTextPosition(el)}
                  text={el.text}
                  align="center"
                  fill={el.stroke || "#000000"}
                  listening={false}
                  rotation={el.rotation || 0}
                />
              )}
            </>
          );
        })}
        {Object.entries(remoteCursors).map(([userId, cursor]) => {
          const cursorColor = getUserColor(userId);
          return (
            <Group key={userId} x={cursor.x} y={cursor.y}>
              {/* Cursor arrow - proper SVG-like shape */}
              <KonvaImage
                image={cursorImage}
                width={30}
                height={30}
                offsetX={11}
                offsetY={7}
              />

              {/* Username label with background */}
              <Text
                x={12}
                y={16}
                text={cursor.username || userId.slice(0, 6)}
                fontSize={11}
                fontFamily="Arial"
                fill={cursorColor}
                padding={0}
                backgroundColor={cursorColor}
                cornerRadius={4}
              />
            </Group>
          );
        })}
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 10 || newBox.height < 10 ? oldBox : newBox
          }
          enabledAnchors={
            shapes.find((s) => s.id === selectedId)?.type === "circle"
              ? ["top-left", "top-right", "bottom-left", "bottom-right"]
              : undefined
          }
          keepRatio={shapes.find((s) => s.id === selectedId)?.type === "circle"}
          rotateEnabled={true}
        />
      </Layer>
    </Stage>
  );
}
