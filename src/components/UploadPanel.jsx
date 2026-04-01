import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ga } from '../utils/analytics';

async function captureScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'never', displaySurface: 'monitor' },
    audio: false,
    selfBrowserSurface: 'include',
    surfaceSwitching: 'include',
    systemAudio: 'exclude',
  });
  const track = stream.getVideoTracks()[0];
  const canvas = document.createElement('canvas');
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  track.stop();
  return canvas.toDataURL('image/png');
}

export default function UploadPanel({ which, image, onUpload, onCapture, onClear, label }) {
  const onDrop = useCallback(
    (files) => {
      if (files.length > 0) { onUpload(which, files[0]); ga.imageUpload(which); }
    },
    [which, onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'] },
    multiple: false,
  });

  if (image) {
    return (
      <div className="upload-panel has-image">
        <div className="upload-preview">
          <img src={image} alt={label} />

        </div>
        <button className="btn-clear" onClick={() => { onClear(which); ga.clearImage(which); }} title="Remove image">
          ✕
        </button>
        <button
          className="btn-capture-overlay"
          onClick={async () => {
            try {
              const dataUrl = await captureScreen();
              onCapture(which, dataUrl);
              ga.screenCapture(which);
            } catch { /* user cancelled */ }
          }}
          title="Re-capture screen"
        >
          📷
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`upload-panel dropzone ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="dropzone-content">
        <span className="dropzone-icon">📷</span>
        <p className="dropzone-label">{label}</p>
        <p className="dropzone-hint">
          {isDragActive ? 'Drop it here...' : 'Drag & drop or click to upload'}
        </p>
        <button
          type="button"
          className="btn-secondary btn-sm btn-capture"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const dataUrl = await captureScreen();
              onCapture(which, dataUrl);
              ga.screenCapture(which);
            } catch { /* user cancelled */ }
          }}
        >
          🖥 Capture Screen
        </button>
      </div>
    </div>
  );
}
