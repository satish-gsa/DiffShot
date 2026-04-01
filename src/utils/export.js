import { toPng } from 'html-to-image';

/**
 * Before html-to-image capture, rasterize every Konva stage canvas
 * into a plain <img> that html-to-image can clone. Returns a cleanup
 * function that restores the DOM.
 */
function rasterizeKonvaStages(root) {
  const konvaDivs = root.querySelectorAll('.konvajs-content');
  const restorers = [];

  konvaDivs.forEach((div) => {
    const canvas = div.querySelector('canvas');
    if (!canvas) return;

    // Create a plain image copy of the canvas
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.cssText = `
      position: absolute; top: 0; left: 0;
      width: ${canvas.style.width || canvas.width + 'px'};
      height: ${canvas.style.height || canvas.height + 'px'};
      pointer-events: none;
    `;

    // Hide the Konva div, inject the img alongside it
    div.style.display = 'none';
    div.parentNode.insertBefore(img, div.nextSibling);

    restorers.push(() => {
      div.style.display = '';
      img.remove();
    });
  });

  return () => restorers.forEach((fn) => fn());
}

const exportOptions = {
  pixelRatio: 2,
  backgroundColor: '#1a1a2e',
};

export async function downloadPng(element, filename = 'comparison.png') {
  if (!element) return;
  const restore = rasterizeKonvaStages(element);
  try {
    const dataUrl = await toPng(element, exportOptions);
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    restore();
  }
}

export async function copyToClipboard(element) {
  if (!element) return;
  const restore = rasterizeKonvaStages(element);
  try {
    const dataUrl = await toPng(element, exportOptions);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
  } finally {
    restore();
  }
}

export function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );
      resolve(canvas.toDataURL('image/png'));
    };
    image.src = imageSrc;
  });
}

// Auto-crop an image to a given aspect ratio (center crop)
export function autoCropToAspect(imageSrc, aspect) {
  return new Promise((resolve) => {
    if (!aspect || !imageSrc) {
      resolve(imageSrc);
      return;
    }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const imgW = image.naturalWidth;
      const imgH = image.naturalHeight;
      let cropW, cropH;
      if (imgW / imgH > aspect) {
        cropH = imgH;
        cropW = imgH * aspect;
      } else {
        cropW = imgW;
        cropH = imgW / aspect;
      }
      const x = (imgW - cropW) / 2;
      const y = (imgH - cropH) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, x, y, cropW, cropH, 0, 0, cropW, cropH);
      resolve(canvas.toDataURL('image/png'));
    };
    image.src = imageSrc;
  });
}
