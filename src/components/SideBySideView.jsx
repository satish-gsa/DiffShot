import { useRef, useCallback } from 'react';
import AnnotationLayer from './AnnotationLayer';

function PannableImage({ which, src, ann, annotationActions, showLabels, label, transform, onTransformChange }) {
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isPanTool = ann.tool === 'pan';

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
    onTransformChange(which, {
      ...transform,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  }, [which, transform, onTransformChange]);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newZoom = Math.max(0.1, Math.min(5, transform.zoom + delta));
    onTransformChange(which, { ...transform, zoom: newZoom });
  }, [which, transform, onTransformChange]);

  return (
    <div
      className="side-panel"
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
  );
}

export default function SideBySideView({
  before,
  after,
  ann,
  annotationActions,
  containerRef,
  showLabels = true,
  imageTransform,
  onTransformChange,
}) {
  const handleTransform = useCallback((which, value) => {
    onTransformChange((prev) => ({ ...prev, [which]: value }));
  }, [onTransformChange]);

  return (
    <div className="side-by-side-view" ref={containerRef}>
      <PannableImage
        which="before"
        src={before}
        ann={ann}
        annotationActions={annotationActions}
        showLabels={showLabels}
        label="BEFORE"
        transform={imageTransform.before}
        onTransformChange={handleTransform}
      />
      <div className="side-divider" />
      <PannableImage
        which="after"
        src={after}
        ann={ann}
        annotationActions={annotationActions}
        showLabels={showLabels}
        label="AFTER"
        transform={imageTransform.after}
        onTransformChange={handleTransform}
      />
    </div>
  );
}
