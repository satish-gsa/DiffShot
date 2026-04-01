import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/export';

export default function CropModal({ imageSrc, aspect, onDone, onClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    const croppedUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
    onDone(croppedUrl);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-header">
          <h3>Crop Image</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="crop-controls">
          <label>
            Zoom:
            <input
              type="range"
              min={1}
              max={5}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <div className="crop-actions">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleApply}>Apply Crop</button>
          </div>
        </div>
      </div>
    </div>
  );
}
