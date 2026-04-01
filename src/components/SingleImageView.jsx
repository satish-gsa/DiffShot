import { useRef, useCallback } from 'react';
import AnnotationLayer from './AnnotationLayer';

export default function SingleImageView({
  which,
  src,
  ann,
  annotationActions,
  containerRef,
  showLabels = true,
  label,
  imageTransform,
  onTransformChange,
}) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isPanTool = ann.tool === 'pan';
  const transform = imageTransform[which] || { x: 0, y: 0, zoom: 1 };

  const handleTransform = useCallback((_, value) => {
    onTransformChange((prev) => ({ ...prev, [which]: value }));
  }, [which, onTransformChange]);

  const handleMouseDown = useCallback((e) => {
    if (!isPanTool) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  }, [isPanTool, transform.x, transform.y]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    handleTransform(which, {
      ...transform,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [which, transform, handleTransform]);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.max(0.1, Math.min(5, transform.zoom + delta));
    handleTransform(which, { ...transform, zoom: newZoom });
  }, [which, transform, handleTransform]);

  return (
    <div className="single-image-view" ref={containerRef}>
      <div
        className="side-panel single-panel"
        onClick={() => annotationActions.setActiveImage(which)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {showLabels && <div className="side-label">{label}</div>}
        {transform.zoom !== 1 && (
          <div className="zoom-badge">{Math.round(transform.zoom * 100)}%</div>
        )}
        <div
          className="image-wrapper"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            transformOrigin: 'center center',
            cursor: isPanTool ? (dragging.current ? 'grabbing' : 'grab') : undefined,
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          <img src={src} alt={label} draggable={false} />
          <AnnotationLayer
            which={which}
            image={src}
            ann={ann}
            actions={annotationActions}
          />
        </div>
      </div>
    </div>
  );
}
