export const getShapeCenter = (node, shape) => {
  if (!node || !shape) return { x: 0, y: 0 };

  if (shape.type === "circle" || shape.type === "ellipse") {
    return { x: node.x(), y: node.y() };
  }

  if (["diamond", "parallelogram", "triangle"].includes(shape.type)) {
    const points = shape.points;
    const xs = points.filter((_, i) => i % 2 === 0);
    const ys = points.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const localCx = (minX + maxX) / 2;
    const localCy = (minY + maxY) / 2;

    const rotation = (node.rotation() * Math.PI) / 180;

    return {
      x: node.x() + localCx * Math.cos(rotation) - localCy * Math.sin(rotation),
      y: node.y() + localCx * Math.sin(rotation) + localCy * Math.cos(rotation),
    };
  }

  const rotation = (node.rotation() * Math.PI) / 180;
  const hw = node.width() / 2;
  const hh = node.height() / 2;

  return {
    x: node.x() + hw * Math.cos(rotation) - hh * Math.sin(rotation),
    y: node.y() + hw * Math.sin(rotation) + hh * Math.cos(rotation),
  };
};

export const getShapeEdgePoint = (node, shape, targetX, targetY) => {
  if (!node) return { x: 0, y: 0 };

  const center = getShapeCenter(node, shape);
  const cx = center.x;
  const cy = center.y;
  const angle = Math.atan2(targetY - cy, targetX - cx);

  if (shape.type === "circle") {
    return {
      x: cx + shape.radius * Math.cos(angle),
      y: cy + shape.radius * Math.sin(angle),
    };
  }

  if (shape.type === "ellipse") {
    const rotation = (node.rotation() * Math.PI) / 180;
    const localAngle = angle - rotation;
    const rx = shape.radiusX;
    const ry = shape.radiusY;

    const lx = rx * Math.cos(localAngle);
    const ly = ry * Math.sin(localAngle);
    return {
      x: cx + lx * Math.cos(rotation) - ly * Math.sin(rotation),
      y: cy + lx * Math.sin(rotation) + ly * Math.cos(rotation),
    };
  }

  if (["diamond", "parallelogram", "triangle"].includes(shape.type)) {
    const rotation = (node.rotation() * Math.PI) / 180;
    const localAngle = angle - rotation;

    const points = shape.points;
    const numPoints = points.length / 2;
    let closestPoint = null;
    let minDist = Infinity;

    for (let i = 0; i < numPoints; i++) {
      const x1 = points[i * 2];
      const y1 = points[i * 2 + 1];
      const x2 = points[((i + 1) % numPoints) * 2];
      const y2 = points[((i + 1) % numPoints) * 2 + 1];

      const rayDx = Math.cos(localAngle);
      const rayDy = Math.sin(localAngle);

      const edgeDx = x2 - x1;
      const edgeDy = y2 - y1;

      const denom = rayDx * edgeDy - rayDy * edgeDx;
      if (Math.abs(denom) < 1e-10) continue;

      const t = (x1 * edgeDy - y1 * edgeDx) / denom;
      const u = (x1 * rayDy - y1 * rayDx) / denom;

      if (t > 0 && u >= 0 && u <= 1) {
        const ix = rayDx * t;
        const iy = rayDy * t;
        const dist = Math.sqrt(ix * ix + iy * iy);
        if (dist < minDist) {
          minDist = dist;
          closestPoint = { x: ix, y: iy };
        }
      }
    }

    if (closestPoint) {
      return {
        x:
          cx +
          closestPoint.x * Math.cos(rotation) -
          closestPoint.y * Math.sin(rotation),
        y:
          cy +
          closestPoint.x * Math.sin(rotation) +
          closestPoint.y * Math.cos(rotation),
      };
    }
    return { x: cx, y: cy };
  }

  if (shape.type === "rect" || shape.type === "roundedRect") {
    const rotation = (node.rotation() * Math.PI) / 180;
    const hw = node.width() / 2;
    const hh = node.height() / 2;
    const localAngle = angle - rotation;
    const tanAngle = Math.tan(localAngle);

    let lx, ly;
    if (Math.abs(tanAngle) <= hh / hw) {
      lx = localAngle > -Math.PI / 2 && localAngle < Math.PI / 2 ? hw : -hw;
      ly = tanAngle * lx;
    } else {
      ly = localAngle > 0 ? hh : -hh;
      lx = ly / tanAngle;
    }

    return {
      x: cx + lx * Math.cos(rotation) - ly * Math.sin(rotation),
      y: cy + lx * Math.sin(rotation) + ly * Math.cos(rotation),
    };
  }

  return { x: cx, y: cy };
};

export const getTextPosition = (shape) => {
  if (shape.type === "circle") {
    return {
      x: shape.x - shape.radius,
      y: shape.y - 7,
      width: shape.radius * 2,
      fontSize: Math.max(10, shape.radius * 0.25),
    };
  }

  if (shape.type === "ellipse") {
    return {
      x: shape.x - shape.radiusX,
      y: shape.y - 7,
      width: shape.radiusX * 2,
      fontSize: Math.max(10, shape.radiusX * 0.25),
    };
  }

  if (
    shape.type === "diamond" ||
    shape.type === "parallelogram" ||
    shape.type === "triangle"
  ) {
    const xs = shape.points.filter((_, i) => i % 2 === 0);
    const ys = shape.points.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = maxX - minX;

    return {
      x: shape.x + minX,
      y: shape.y + (minY + maxY) / 2 - 7,
      width: w,
      fontSize: Math.max(10, w * 0.08),
    };
  }

  if (shape.type === "rect" || shape.type === "roundedRect") {
    return {
      x: shape.x,
      y: shape.y + shape.height / 2 - 7,
      width: shape.width,
      fontSize: Math.max(10, Math.min(shape.width, shape.height) * 0.2),
    };
  }

  return { x: shape.x, y: shape.y, width: 100 };
};

export const getExistingContentBounds = (shapes) => {
  if (shapes.length === 0) {
    return null;
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  shapes.forEach((shape) => {
    let shapeMinX, shapeMaxX, shapeMinY, shapeMaxY;

    if (shape.type === "circle" || shape.type === "ellipse") {
      const rx = shape.radiusX || shape.radius || 50;
      const ry = shape.radiusY || shape.radius || 50;
      shapeMinX = shape.x - rx;
      shapeMaxX = shape.x + rx;
      shapeMinY = shape.y - ry;
      shapeMaxY = shape.y + ry;
    } else if (shape.points) {
      const xs = shape.points.filter((_, i) => i % 2 === 0);
      const ys = shape.points.filter((_, i) => i % 2 === 1);
      shapeMinX = shape.x + Math.min(...xs);
      shapeMaxX = shape.x + Math.max(...xs);
      shapeMinY = shape.y + Math.min(...ys);
      shapeMaxY = shape.y + Math.max(...ys);
    } else {
      shapeMinX = shape.x;
      shapeMaxX = shape.x + (shape.width || 100);
      shapeMinY = shape.y;
      shapeMaxY = shape.y + (shape.height || 80);
    }

    minX = Math.min(minX, shapeMinX);
    maxX = Math.max(maxX, shapeMaxX);
    minY = Math.min(minY, shapeMinY);
    maxY = Math.max(maxY, shapeMaxY);
  });

  return { minX, minY, maxX, maxY };
};
