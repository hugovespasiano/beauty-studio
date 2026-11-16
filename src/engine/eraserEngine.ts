/**
 * Beauty Studio - Smart Inpainting & Spot Eraser Engine
 * Fast on-device inpainting for blemishes, pimples, stray hairs and small unwanted objects.
 * Uses iterative Laplace boundary diffusion with gradient continuity.
 */

export class EraserEngine {
  /**
   * Inpaints masked areas on the canvas using surrounding boundary pixels.
   * @param ctx Target canvas context
   * @param maskCtx Canvas containing the mask (white = erase, black/transparent = keep)
   * @param width Canvas width
   * @param height Canvas height
   */
  static inpaint(
    ctx: CanvasRenderingContext2D,
    maskCtx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const maskData = maskCtx.getImageData(0, 0, width, height);
    const src = imgData.data;
    const mask = maskData.data;

    // Identify masked pixels and find bounding box of damage
    let minX = width, minY = height, maxX = 0, maxY = 0;
    let hasMask = false;

    const isHole = new Uint8Array(width * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Mask is active if red or alpha > 50
        if (mask[idx + 3] > 50 || mask[idx] > 50) {
          isHole[y * width + x] = 1;
          hasMask = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasMask) return;

    // Pad bounding box
    minX = Math.max(0, minX - 5);
    minY = Math.max(0, minY - 5);
    maxX = Math.min(width - 1, maxX + 5);
    maxY = Math.min(height - 1, maxY + 5);

    // Iterative diffusion: fill holes with average of non-hole neighbors
    const rArr = new Float32Array(width * height);
    const gArr = new Float32Array(width * height);
    const bArr = new Float32Array(width * height);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const i = y * width + x;
        const idx = i * 4;
        rArr[i] = src[idx];
        gArr[i] = src[idx + 1];
        bArr[i] = src[idx + 2];
      }
    }

    // Run 15 relaxation passes for smooth blending
    const passes = 15;
    for (let p = 0; p < passes; p++) {
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const i = y * width + x;
          if (!isHole[i]) continue;

          let sumR = 0, sumG = 0, sumB = 0, count = 0;

          // 4-neighborhood
          if (x > 0) {
            sumR += rArr[i - 1]; sumG += gArr[i - 1]; sumB += bArr[i - 1]; count++;
          }
          if (x < width - 1) {
            sumR += rArr[i + 1]; sumG += gArr[i + 1]; sumB += bArr[i + 1]; count++;
          }
          if (y > 0) {
            sumR += rArr[i - width]; sumG += gArr[i - width]; sumB += bArr[i - width]; count++;
          }
          if (y < height - 1) {
            sumR += rArr[i + width]; sumG += gArr[i + width]; sumB += bArr[i + width]; count++;
          }

          if (count > 0) {
            rArr[i] = sumR / count;
            gArr[i] = sumG / count;
            bArr[i] = sumB / count;
          }
        }
      }
    }

    // Write back into ImageData
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const i = y * width + x;
        if (isHole[i]) {
          const idx = i * 4;
          src[idx] = Math.round(rArr[i]);
          src[idx + 1] = Math.round(gArr[i]);
          src[idx + 2] = Math.round(bArr[i]);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Clear mask
    maskCtx.clearRect(0, 0, width, height);
  }
}
