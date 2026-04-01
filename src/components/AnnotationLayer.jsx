import { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Transformer } from 'react-konva';
import { genId } from '../hooks/useAnnotations';

export default function AnnotationLayer({ which, image, ann, actions }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const drawingId = useRef(null);
  const shapeStart = useRef(null);

  // Resize observer to match container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Update transformer selection
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    if (ann.tool !== 'pointer' || !ann.selectedId || ann.activeImage !== which) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }
    const node = stageRef.current.findOne(`#${ann.selectedId}`);
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [ann.selectedId, ann.tool, ann.activeImage, which, ann.annotations]);

  const isActive = ann.activeImage === which;
  const annotations = ann.annotations[which] || [];

  const getPointerPos = () => {
    const stage = stageRef.current;
    return stage?.getPointerPosition();
  };

  const handleMouseDown = useCallback((e) => {
    if (!isActive) {
      actions.setActiveImage(which);
      return;
    }

    const pos = getPointerPos();
    if (!pos) return;

    if (ann.tool === 'pointer') {
      // Click on empty area deselects
      if (e.target === e.target.getStage()) {
        actions.setSelected(null);
      }
      return;
    }

    if (ann.tool === 'draw') {
      const id = genId();
      drawingId.current = id;
      actions.addAnnotation(which, {
        id,
        type: 'draw',
        points: [pos.x, pos.y],
        color: ann.color,
        strokeWidth: ann.strokeWidth,
      });
      actions.setDrawing(true);
      return;
    }

    if (ann.tool === 'text') {
      const id = genId();
      actions.addAnnotation(which, {
        id,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Text',
        color: ann.color,
        fontSize: ann.fontSize,
      });
      actions.setSelected(id);
      actions.setTool('pointer');
      return;
    }

    if (['rect', 'circle', 'arrow'].includes(ann.tool)) {
      shapeStart.current = pos;
      const id = genId();
      drawingId.current = id;

      if (ann.tool === 'rect') {
        actions.addAnnotation(which, {
          id, type: 'rect',
          x: pos.x, y: pos.y, width: 0, height: 0,
          color: ann.color, strokeWidth: ann.strokeWidth,
        });
      } else if (ann.tool === 'circle') {
        actions.addAnnotation(which, {
          id, type: 'circle',
          x: pos.x, y: pos.y, radiusX: 0, radiusY: 0,
          color: ann.color, strokeWidth: ann.strokeWidth,
        });
      } else if (ann.tool === 'arrow') {
        actions.addAnnotation(which, {
          id, type: 'arrow',
          points: [pos.x, pos.y, pos.x, pos.y],
          color: ann.color, strokeWidth: ann.strokeWidth,
        });
      }

      actions.setDrawing(true);
    }
  }, [isActive, which, ann.tool, ann.color, ann.strokeWidth, ann.fontSize, actions]);

  const handleMouseMove = useCallback(() => {
    if (!ann.isDrawing || !isActive) return;
    const pos = getPointerPos();
    if (!pos) return;

    const id = drawingId.current;
    if (!id) return;

    const current = annotations.find((a) => a.id === id);
    if (!current) return;

    if (current.type === 'draw') {
      actions.updateDrawingPoints(which, id, [...current.points, pos.x, pos.y]);
    } else if (current.type === 'rect') {
      const start = shapeStart.current;
      actions.updateDrawingPoints(which, id, null); // trigger re-render trick
      actions.updateAnnotation(which, id, {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      });
    } else if (current.type === 'circle') {
      const start = shapeStart.current;
      actions.updateAnnotation(which, id, {
        x: (start.x + pos.x) / 2,
        y: (start.y + pos.y) / 2,
        radiusX: Math.abs(pos.x - start.x) / 2,
        radiusY: Math.abs(pos.y - start.y) / 2,
      });
    } else if (current.type === 'arrow') {
      const start = shapeStart.current;
      actions.updateAnnotation(which, id, {
        points: [start.x, start.y, pos.x, pos.y],
      });
    }
  }, [ann.isDrawing, isActive, annotations, which, actions]);

  const handleMouseUp = useCallback(() => {
    if (!ann.isDrawing) return;
    actions.setDrawing(false);
    if (drawingId.current) {
      actions.commitDrawing(which);
      actions.setTool('pointer');
      actions.setSelected(drawingId.current);
    }
    drawingId.current = null;
    shapeStart.current = null;
  }, [ann.isDrawing, which, actions]);

  const handleDblClick = useCallback((e) => {
    const target = e.target;
    const id = target.id?.();
    if (!id) return;
    const a = annotations.find((x) => x.id === id);
    if (!a || a.type !== 'text') return;

    // Inline text editing
    const textNode = target;
    const stage = stageRef.current;
    const stageBox = stage.container().getBoundingClientRect();
    const textPos = textNode.absolutePosition();

    const textarea = document.createElement('textarea');
    textarea.value = a.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPos.y}px`;
    textarea.style.left = `${stageBox.left + textPos.x}px`;
    textarea.style.fontSize = `${a.fontSize}px`;
    textarea.style.color = a.color;
    textarea.style.border = '1px solid #0088ff';
    textarea.style.padding = '2px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'rgba(0,0,0,0.8)';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.fontFamily = 'sans-serif';
    textarea.style.lineHeight = '1.2';
    textarea.style.zIndex = '10000';
    textarea.style.minWidth = '60px';
    textarea.style.minHeight = '30px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      const val = textarea.value;
      document.body.removeChild(textarea);
      actions.updateAnnotation(which, id, { text: val });
    };

    textarea.addEventListener('blur', removeTextarea);
    textarea.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        textarea.blur();
      }
      if (ev.key === 'Escape') {
        textarea.blur();
      }
    });
  }, [annotations, which, actions]);

  const handleDragEnd = useCallback((e) => {
    const id = e.target.id?.();
    if (!id) return;
    const a = annotations.find((x) => x.id === id);
    if (!a) return;

    if (a.type === 'draw' || a.type === 'arrow') {
      // Don't update x/y — Konva moves the node visually
      // We need to update points relative to the new position
    } else {
      actions.updateAnnotation(which, id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  }, [annotations, which, actions]);

  const cursorMap = {
    pointer: 'default',
    draw: 'crosshair',
    rect: 'crosshair',
    circle: 'crosshair',
    arrow: 'crosshair',
    text: 'text',
    pan: 'grab',
  };

  return (
    <div
      ref={containerRef}
      className={`annotation-layer ${isActive ? 'active' : ''}`}
      style={{
        cursor: isActive ? cursorMap[ann.tool] || 'default' : 'default',
        pointerEvents: ann.tool === 'pan' ? 'none' : 'auto',
      }}
    >
      {size.width > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onDblClick={handleDblClick}
        >
          <Layer>
            {annotations.map((a) => {
              const isDraggable = isActive && ann.tool === 'pointer';
              const common = { key: a.id, id: a.id, draggable: isDraggable, onDragEnd: handleDragEnd };

              if (a.type === 'draw') {
                return (
                  <Line
                    {...common}
                    points={a.points}
                    stroke={a.color}
                    strokeWidth={a.strokeWidth}
                    tension={0.5}
                    lineCap="round"
                    lineJoin="round"
                    onClick={() => isActive && actions.setSelected(a.id)}
                  />
                );
              }
              if (a.type === 'rect') {
                return (
                  <Rect
                    {...common}
                    x={a.x}
                    y={a.y}
                    width={a.width}
                    height={a.height}
                    stroke={a.color}
                    strokeWidth={a.strokeWidth}
                    onClick={() => isActive && actions.setSelected(a.id)}
                  />
                );
              }
              if (a.type === 'circle') {
                return (
                  <Circle
                    {...common}
                    x={a.x}
                    y={a.y}
                    radiusX={a.radiusX}
                    radiusY={a.radiusY}
                    radius={Math.max(a.radiusX || 0, a.radiusY || 0)}
                    stroke={a.color}
                    strokeWidth={a.strokeWidth}
                    scaleX={a.radiusX && a.radiusY ? a.radiusX / Math.max(a.radiusX, a.radiusY) : 1}
                    scaleY={a.radiusX && a.radiusY ? a.radiusY / Math.max(a.radiusX, a.radiusY) : 1}
                    onClick={() => isActive && actions.setSelected(a.id)}
                  />
                );
              }
              if (a.type === 'arrow') {
                return (
                  <Arrow
                    {...common}
                    points={a.points}
                    stroke={a.color}
                    strokeWidth={a.strokeWidth}
                    fill={a.color}
                    pointerLength={10}
                    pointerWidth={8}
                    onClick={() => isActive && actions.setSelected(a.id)}
                  />
                );
              }
              if (a.type === 'text') {
                return (
                  <Text
                    {...common}
                    x={a.x}
                    y={a.y}
                    text={a.text}
                    fontSize={a.fontSize}
                    fill={a.color}
                    fontFamily="sans-serif"
                    onClick={() => isActive && actions.setSelected(a.id)}
                  />
                );
              }
              return null;
            })}
            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      )}
    </div>
  );
}
