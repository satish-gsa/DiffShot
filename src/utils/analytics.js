/**
 * Lightweight Google Analytics event helper.
 * Falls back silently if gtag is not loaded.
 */
export function trackEvent(action, category, label, value) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      ...(value !== undefined && { value }),
    });
  }
}

// Pre-built helpers for common events
export const ga = {
  imageUpload: (which) => trackEvent('upload_image', 'images', which),
  screenCapture: (which) => trackEvent('screen_capture', 'images', which),
  clearImage: (which) => trackEvent('clear_image', 'images', which),
  swapImages: () => trackEvent('swap_images', 'images'),
  cropImage: (which) => trackEvent('crop_image', 'images', which),
  aspectRatio: (label) => trackEvent('set_aspect_ratio', 'images', label),

  viewMode: (mode) => trackEvent('change_view_mode', 'view', mode),
  toggleLabels: (show) => trackEvent('toggle_labels', 'view', show ? 'show' : 'hide'),
  toggleTheme: (theme) => trackEvent('toggle_theme', 'view', theme),

  selectTool: (tool) => trackEvent('select_tool', 'annotations', tool),
  changeColor: (color) => trackEvent('change_color', 'annotations', color),
  changeStroke: (width) => trackEvent('change_stroke', 'annotations', String(width)),
  changeFontSize: (size) => trackEvent('change_font_size', 'annotations', String(size)),
  undo: () => trackEvent('undo', 'annotations'),
  redo: () => trackEvent('redo', 'annotations'),
  clearAnnotations: () => trackEvent('clear_annotations', 'annotations'),
  deleteAnnotation: () => trackEvent('delete_annotation', 'annotations'),
  resetPosition: () => trackEvent('reset_position', 'annotations'),

  exportPng: () => trackEvent('export_png', 'export'),
  copyClipboard: () => trackEvent('copy_clipboard', 'export'),
  compareNew: () => trackEvent('compare_new', 'export'),
};
