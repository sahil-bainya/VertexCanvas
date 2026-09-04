import { Stage, Layer, Transformer, Arrow, Text } from "react-konva";
import { SHAPE_CONFIG } from "./shapeConfig.jsx";
import { getTextPosition } from "./canvasHelper.js";
import "./BoardStyle.css";

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
}) {
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
            onClick={() =>{ setSelectedArrowId(arrow.id);setSelectedId(null)}} // ← naya
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
