const MODES = [
  { key: 'side-by-side', label: 'Side by Side', icon: '⬜⬜' },
  { key: 'slider', label: 'Slider (50|50)', icon: '◧' },
  { key: 'overlay', label: 'Overlay', icon: '🔲' },
];

export default function ViewModeToggle({ mode, onModeChange }) {
  return (
    <div className="view-mode-toggle">
      {MODES.map((m) => (
        <button
          key={m.key}
          className={`btn-mode ${mode === m.key ? 'active' : ''}`}
          onClick={() => onModeChange(m.key)}
          title={m.label}
        >
          <span className="mode-icon">{m.icon}</span>
          <span className="mode-label">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
