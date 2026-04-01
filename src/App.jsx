import { useRef, useEffect, useCallback, useState } from 'react';
import UploadPanel from './components/UploadPanel';
import AspectRatioSelector from './components/AspectRatioSelector';
import CropModal from './components/CropModal';
import ViewModeToggle from './components/ViewModeToggle';
import SideBySideView from './components/SideBySideView';
import SliderView from './components/SliderView';
import OverlayView from './components/OverlayView';
import SingleImageView from './components/SingleImageView';
import AnnotationToolbar from './components/AnnotationToolbar';
import useImageState from './hooks/useImageState';
import useAnnotations from './hooks/useAnnotations';
import { downloadPng, copyToClipboard, autoCropToAspect } from './utils/export';
import { ga } from './utils/analytics';

export default function App() {
  const {
    images,
    setImage,
    setImageUrl,
    setCropped,
    setZoom,
    openCrop,
    closeCrop,
    setAspect,
    clearImage,
    swapImages,
    resetAll: resetImages,
  } = useImageState();

  const {
    ann,
    setTool,
    setColor,
    setStrokeWidth,
    setFontSize,
    setActiveImage,
    setSelected,
    setDrawing,
    addAnnotation,
    updateAnnotation,
    updateDrawingPoints,
    commitDrawing,
    deleteAnnotation,
    undo,
    redo,
    clearAnnotations,
  } = useAnnotations();

  const [viewMode, setViewMode] = useState('side-by-side');
  const [exporting, setExporting] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [theme, setTheme] = useState('light');
  const [imageTransform, setImageTransform] = useState({
    before: { x: 0, y: 0, zoom: 1 },
    after: { x: 0, y: 0, zoom: 1 },
  });
  const containerRef = useRef(null);

  // Sync theme class on <html> so body/root vars update globally
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const bothUploaded = images.before.cropped && images.after.cropped;
  const hasAnyImage = images.before.cropped || images.after.cropped;
  const singleWhich = !bothUploaded && images.before.cropped ? 'before' : !bothUploaded && images.after.cropped ? 'after' : null;

  // Auto-focus annotation layer to the single uploaded image
  useEffect(() => {
    if (singleWhich && ann.activeImage !== singleWhich) {
      setActiveImage(singleWhich);
    }
  }, [singleWhich, ann.activeImage, setActiveImage]);

  const annotationActions = {
    setActiveImage,
    setSelected,
    setDrawing,
    addAnnotation,
    updateAnnotation,
    updateDrawingPoints,
    commitDrawing,
    deleteAnnotation,
    setTool,
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo(ann.activeImage);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo(ann.activeImage);
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (ann.selectedId) {
          e.preventDefault();
          deleteAnnotation(ann.activeImage, ann.selectedId);
        }
      }
      // Tool shortcuts
      if (e.key === 'v') setTool('pointer');
      if (e.key === 'p') setTool('pan');
      if (e.key === 'd') setTool('draw');
      if (e.key === 'r') setTool('rect');
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) setTool('circle');
      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) setTool('arrow');
      if (e.key === 't') setTool('text');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ann.activeImage, ann.selectedId, ann.tool, undo, redo, deleteAnnotation, setTool]);

  const handleExportPng = useCallback(async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      await downloadPng(containerRef.current, `compare-${Date.now()}.png`);
      ga.exportPng();
    } finally {
      setExporting(false);
    }
  }, []);

  const handleCopyClipboard = useCallback(async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      await copyToClipboard(containerRef.current);
      ga.copyClipboard();
    } finally {
      setExporting(false);
    }
  }, []);

  const handleCropDone = useCallback(
    (url) => {
      setCropped(images.cropTarget, url);
      closeCrop();
    },
    [images.cropTarget, setCropped, closeCrop],
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>◐ DiffShot</h1>
        <p className="app-subtitle">
          Capture, compare &amp; annotate visual diffs
        </p>
        <button
          className="btn-theme-toggle"
          onClick={() => setTheme((t) => { const next = t === 'light' ? 'dark' : 'light'; ga.toggleTheme(next); return next; })}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      {/* Upload Section */}
      <section className="upload-section">
        <UploadPanel
          which="before"
          image={images.before.cropped}
          onUpload={setImage}
          onCapture={setImageUrl}
          onClear={clearImage}
          label="BEFORE (Current)"
        />
        <div className="upload-middle">
          {bothUploaded && (
            <button className="btn-swap" onClick={() => { swapImages(); ga.swapImages(); }} title="Swap images">
              ⇄
            </button>
          )}
        </div>
        <UploadPanel
          which="after"
          image={images.after.cropped}
          onUpload={setImage}
          onCapture={setImageUrl}
          onClear={clearImage}
          label="AFTER (New)"
        />
      </section>

      {/* Image Controls */}
      {hasAnyImage && (
        <>
          <section className="controls-section">
              <AspectRatioSelector
              current={images.aspectLabel}
              onSelect={async (ratio, label) => {
                ga.aspectRatio(label);
                setAspect(ratio, label);
                if (ratio) {
                  const promises = [];
                  if (images.before.original) promises.push(autoCropToAspect(images.before.original, ratio).then((url) => setCropped('before', url)));
                  if (images.after.original) promises.push(autoCropToAspect(images.after.original, ratio).then((url) => setCropped('after', url)));
                  await Promise.all(promises);
                } else {
                  if (images.before.original) setCropped('before', images.before.original);
                  if (images.after.original) setCropped('after', images.after.original);
                }
              }}
              onCropBefore={images.before.cropped ? () => { openCrop('before'); ga.cropImage('before'); } : null}
              onCropAfter={images.after.cropped ? () => { openCrop('after'); ga.cropImage('after'); } : null}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels((v) => { ga.toggleLabels(!v); return !v; })}
            />
            {bothUploaded && (
            <div className="controls-row">
              <ViewModeToggle mode={viewMode} onModeChange={(m) => { setViewMode(m); ga.viewMode(m); }} />
            </div>
            )}
          </section>

          {/* Annotation Toolbar */}
          {(viewMode === 'side-by-side' || singleWhich) && (
            <>
              <AnnotationToolbar
              ann={ann}
              onSetTool={(t) => { setTool(t); ga.selectTool(t); }}
              onSetColor={(c) => { setColor(c); ga.changeColor(c); }}
              onSetStrokeWidth={(w) => { setStrokeWidth(w); ga.changeStroke(w); }}
              onSetFontSize={(s) => { setFontSize(s); ga.changeFontSize(s); }}
              onUndo={() => { undo(ann.activeImage); ga.undo(); }}
              onRedo={() => { redo(ann.activeImage); ga.redo(); }}
              onClear={() => { clearAnnotations(ann.activeImage); ga.clearAnnotations(); }}
              onDeleteSelected={() => {
                if (ann.selectedId) { deleteAnnotation(ann.activeImage, ann.selectedId); ga.deleteAnnotation(); }
              }}
              onResetPosition={() => { setImageTransform({ before: { x: 0, y: 0, zoom: 1 }, after: { x: 0, y: 0, zoom: 1 } }); ga.resetPosition(); }}
              onExportPng={handleExportPng}
              onCopyClipboard={handleCopyClipboard}
              onCompareNew={() => {
                ga.compareNew();
                resetImages();
                clearAnnotations('before');
                clearAnnotations('after');
                setImageTransform({ before: { x: 0, y: 0, zoom: 1 }, after: { x: 0, y: 0, zoom: 1 } });
                setViewMode('side-by-side');
                setShowLabels(true);
              }}
              exporting={exporting}
            />
            <div className="toolbar-shortcuts">
              <kbd>V</kbd> Select &nbsp;<kbd>P</kbd> Pan &nbsp;<kbd>D</kbd> Draw &nbsp;<kbd>R</kbd> Rect &nbsp;
              <kbd>C</kbd> Circle &nbsp;<kbd>A</kbd> Arrow &nbsp;<kbd>T</kbd> Text &nbsp;
              <kbd>⌘Z</kbd> Undo &nbsp;<kbd>⌘⇧Z</kbd> Redo &nbsp;<kbd>⌫</kbd> Delete
            </div>
            </>
          )}

          {/* Comparison View */}
          <section className="comparison-section">
            {singleWhich && (
              <SingleImageView
                which={singleWhich}
                src={images[singleWhich].cropped}
                ann={ann}
                annotationActions={annotationActions}
                containerRef={containerRef}
                showLabels={showLabels}
                label={singleWhich === 'before' ? 'BEFORE' : 'AFTER'}
                imageTransform={imageTransform}
                onTransformChange={setImageTransform}
              />
            )}
            {bothUploaded && viewMode === 'side-by-side' && (
              <SideBySideView
                before={images.before.cropped}
                after={images.after.cropped}
                ann={ann}
                annotationActions={annotationActions}
                containerRef={containerRef}
                showLabels={showLabels}
                imageTransform={imageTransform}
                onTransformChange={setImageTransform}
              />
            )}
            {bothUploaded && viewMode === 'slider' && (
              <SliderView
                before={images.before.cropped}
                after={images.after.cropped}
                containerRef={containerRef}
                showLabels={showLabels}
              />
            )}
            {bothUploaded && viewMode === 'overlay' && (
              <OverlayView
                before={images.before.cropped}
                after={images.after.cropped}
                containerRef={containerRef}
                showLabels={showLabels}
              />
            )}
          </section>
        </>
      )}

      {/* Crop Modal */}
      {images.cropTarget && images[images.cropTarget]?.original && (
        <CropModal
          imageSrc={images[images.cropTarget].original}
          aspect={images.aspectRatio}
          onDone={handleCropDone}
          onClose={closeCrop}
        />
      )}

      <footer className="app-footer">
        <p>◐ DiffShot — All processing happens in your browser. No images are uploaded or stored.</p>
      </footer>
    </div>
  );
}
