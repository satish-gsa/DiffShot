const RATIOS = [
  { label: 'Free', ratio: null },
  { label: '1:1', ratio: 1 },
  { label: '16:9', ratio: 16 / 9 },
  { label: '4:3', ratio: 4 / 3 },
  { label: '9:16', ratio: 9 / 16 },
];

export default function AspectRatioSelector({ current, onSelect, onCropBefore, onCropAfter, showLabels, onToggleLabels }) {
  const handleSelect = (ratio, label) => {
    onSelect(ratio, label);
  };

  return (
    <div className="aspect-selector">
      <span className="aspect-label">Aspect:</span>
      <div className="aspect-buttons">
        {RATIOS.map((r) => (
          <button
            key={r.label}
            className={`btn-aspect ${current === r.label ? 'active' : ''}`}
            onClick={() => handleSelect(r.ratio, r.label)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="crop-buttons">
        {onCropBefore && <button className="btn-secondary btn-sm" onClick={onCropBefore}>✂ Crop Before</button>}
        {onCropAfter && <button className="btn-secondary btn-sm" onClick={onCropAfter}>✂ Crop After</button>}
        <button
          className={`btn-secondary btn-sm ${!showLabels ? 'active' : ''}`}
          onClick={onToggleLabels}
          title={showLabels ? 'Hide labels' : 'Show labels'}
        >
          {showLabels ? '🏷 Hide Labels' : '🏷 Show Labels'}
        </button>
      </div>
    </div>
  );
}
