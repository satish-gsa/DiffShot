const TOOLS = [
  { key: 'pointer', label: 'Select', icon: '⇱' },
  { key: 'pan', label: 'Pan / Move Image', icon: '✋' },
  { key: 'draw', label: 'Draw', icon: '✏️' },
  { key: 'rect', label: 'Rectangle', icon: '▭' },
  { key: 'circle', label: 'Circle', icon: '○' },
  { key: 'arrow', label: 'Arrow', icon: '→' },
  { key: 'text', label: 'Text', icon: 'T' },
];

const COLORS = [
  '#ff0000', '#ff6600', '#ffcc00', '#00cc00',
  '#0088ff', '#8800ff', '#ff00ff', '#ffffff', '#000000',
];

export default function AnnotationToolbar({
  ann,
  onSetTool,
  onSetColor,
  onSetStrokeWidth,
  onSetFontSize,
  onUndo,
  onRedo,
  onClear,
  onDeleteSelected,
  onResetPosition,
  onExportPng,
  onCopyClipboard,
  onCompareNew,
  exporting,
}) {
  return (
    <>
    <div className="annotation-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">Tools</span>
        <div className="toolbar-tools">
          {TOOLS.map((t) => (
            <span key={t.key} style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
              <button
                className={`btn-tool ${ann.tool === t.key ? 'active' : ''}`}
                onClick={() => onSetTool(t.key)}
                title={t.label}
              >
                {t.icon}
              </button>
              {t.key === 'pan' && (
                <button
                  className="btn-tool"
                  onClick={onResetPosition}
                  title="Reset pan & zoom"
                  style={{ fontSize: '0.75rem' }}
                >
                  ⌖
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Color</span>
        <div className="toolbar-colors">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`btn-color ${ann.color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => onSetColor(c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Stroke</span>
        <input
          type="range"
          min={1}
          max={12}
          value={ann.strokeWidth}
          onChange={(e) => onSetStrokeWidth(Number(e.target.value))}
          title={`Width: ${ann.strokeWidth}`}
        />
        <span className="toolbar-value">{ann.strokeWidth}px</span>
      </div>

      {ann.tool === 'text' && (
        <div className="toolbar-group">
          <span className="toolbar-label">Font</span>
          <input
            type="range"
            min={10}
            max={48}
            value={ann.fontSize}
            onChange={(e) => onSetFontSize(Number(e.target.value))}
          />
          <span className="toolbar-value">{ann.fontSize}px</span>
        </div>
      )}

      <div className="toolbar-group toolbar-actions">
        <button className="btn-tool" onClick={onUndo} title="Undo (Ctrl+Z)">↩</button>
        <button className="btn-tool" onClick={onRedo} title="Redo (Ctrl+Shift+Z)">↪</button>
        <button className="btn-tool-label" onClick={onDeleteSelected} disabled={!ann.selectedId} title="Delete selected annotation">🗑 Delete Annotation</button>
        <button className="btn-tool-label btn-danger" onClick={onClear} disabled={!(ann.annotations[ann.activeImage]?.length)} title="Clear all annotations">🧹 Clear Annotations</button>
      </div>

      <div className="toolbar-group">
        <span className="active-indicator">
          Annotating: <strong>{ann.activeImage.toUpperCase()}</strong>
        </span>
      </div>
    </div>

    <div className="toolbar-export-row">
      <button className="btn-export" onClick={onExportPng} disabled={exporting}>📥 Download PNG</button>
      <button className="btn-export" onClick={onCopyClipboard} disabled={exporting}>📋 Copy to Clipboard</button>
      <button className="btn-export btn-export-new" onClick={onCompareNew}>🔄 Compare New</button>
    </div>
    </>
  );
}
