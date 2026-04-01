import { useState } from 'react';

export default function OverlayView({ before, after, containerRef, showLabels = true }) {
  const [opacity, setOpacity] = useState(0.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const resetPosition = () => setOffset({ x: 0, y: 0 });

  return (
    <div className="overlay-view" ref={containerRef}>
      <div
        className="overlay-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img src={before} alt="Before" className="overlay-base" draggable={false} />
        <img
          src={after}
          alt="After"
          className="overlay-top"
          style={{
            opacity,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            cursor: dragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          draggable={false}
        />
        {showLabels && <span className="overlay-badge before-badge">BEFORE</span>}
        {showLabels && <span className="overlay-badge after-badge">AFTER</span>}
      </div>
      <div className="overlay-controls">
        <label>
          Opacity:
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
          <span>{Math.round(opacity * 100)}%</span>
        </label>
        <button className="btn-secondary btn-sm" onClick={resetPosition}>
          Reset Position
        </button>
      </div>
    </div>
  );
}
