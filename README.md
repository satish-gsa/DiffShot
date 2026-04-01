# ◐ DiffShot

Capture, compare & annotate visual diffs — entirely in your browser.

Built for QA and dev workflows where you need to compare before/after screenshots of UI changes.

<img width="2808" height="1364" alt="image" src="https://github.com/user-attachments/assets/7a86b12a-375d-4a2a-84a1-ff0d2696628a" />


## Features

- **Upload or Capture** — Drag & drop images or capture any screen/window/tab directly
- **3 Comparison Modes** — Side by Side, Slider (50|50), Overlay with opacity control
- **Annotations** — Draw, rectangles, circles, arrows, text with color/stroke customization
- **Pan & Zoom** — Reposition and zoom images in side-by-side view
- **Aspect Ratios** — Free, 1:1, 16:9, 4:3, 9:16 with auto-crop or manual crop
- **Export** — Download as PNG or copy to clipboard
- **Light / Dark Mode** — Light mode default, toggle with one click
- **Keyboard Shortcuts** — Full shortcut support for fast workflows
- **Privacy** — All processing happens locally. No images are uploaded or stored.

## Quick Start

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:5180`

## Build

```bash
pnpm build
pnpm preview
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `P` | Pan / Move image |
| `D` | Draw |
| `R` | Rectangle |
| `C` | Circle |
| `A` | Arrow |
| `T` | Text |
| `⌘Z` | Undo |
| `⌘⇧Z` | Redo |
| `⌫` | Delete selected |

## Tech Stack

- React 18 + Vite 6
- react-compare-slider — Slider view
- react-konva — Canvas annotations
- react-easy-crop — Image cropping
- react-dropzone — Drag & drop upload
- html-to-image — PNG export

## Workflow

1. Upload or capture before/after screenshots
2. Pick an aspect ratio or crop manually
3. Choose a comparison mode (side-by-side, slider, overlay)
4. Annotate differences with drawing tools
5. Export as PNG or copy to clipboard
6. Click 🔄 to start a new comparison
