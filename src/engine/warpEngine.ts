/**
 * Beauty Studio - Warp & Liquify Engine
 * Provides interactive facial and body deformation (Face Slimming, V-Line, Body Contouring)
 * Running 100% on-device via high-performance pixel displacement buffers.
 */

export interface WarpPoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  strength: number;
}

export class WarpEngine {
  /**
   * Applies a directional push / warp displacement (liquify push) to an ImageData buffer.
   */
  static applyPush(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    radius: number,
    strength: number = 0.5
  ) {
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.5) return;

    const minX = Math.max(0, Math.floor(Math.min(startX, endX) - radius));
    const minY = Math.max(0, Math.floor(Math.min(startY, endY) - radius));
    const maxX = Math.min(width, Math.ceil(Math.max(startX, endX) + radius));
    const maxY = Math.min(height, Math.ceil(Math.max(startY, endY) + radius));

    const w = maxX - minX;
    const h = maxY - minY;
    if (w <= 0 || h <= 0) return;

    const sourceData = ctx.getImageData(minX, minY, w, h);
    const targetData = ctx.createImageData(w, h);
    const src = sourceData.data;
    const dst = targetData.data;

    // Copy original data first
    dst.set(src);

    const radiusSq = radius * radius;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    for (let y = 0; y < h; y++) {
      const currentY = minY + y;
      for (let x = 0; x < w; x++) {
        const currentX = minX + x;
        const dX = currentX - midX;
        const dY = currentY - midY;
        const dSq = dX * dX + dY * dY;

        if (dSq < radiusSq) {
          // Smooth bell-curve falloff factor
          const factor = Math.pow(1 - dSq / radiusSq, 2) * strength;
          const sampleX = currentX - dx * factor;
          const sampleY = currentY - dy * factor;

          const sX = Math.max(0, Math.min(width - 1, sampleX));
          const sY = Math.max(0, Math.min(height - 1, sampleY));

          // Bilinear interpolation
          const x0 = Math.floor(sX);
          const y0 = Math.floor(sY);
          const x1 = Math.min(width - 1, x0 + 1);
          const y1 = Math.min(height - 1, y0 + 1);

          const u = sX - x0;
          const v = sY - y0;

          // Map to local block coordinates
          const lx0 = Math.max(0, Math.min(w - 1, x0 - minX));
          const ly0 = Math.max(0, Math.min(h - 1, y0 - minY));
          const lx1 = Math.max(0, Math.min(w - 1, x1 - minX));
          const ly1 = Math.max(0, Math.min(h - 1, y1 - minY));

          const idx00 = (ly0 * w + lx0) * 4;
          const idx10 = (ly0 * w + lx1) * 4;
          const idx01 = (ly1 * w + lx0) * 4;
          const idx11 = (ly1 * w + lx1) * 4;

          const targetIdx = (y * w + x) * 4;

          for (let c = 0; c < 4; c++) {
            const val =
              (1 - u) * (1 - v) * src[idx00 + c] +
              u * (1 - v) * src[idx10 + c] +
              (1 - u) * v * src[idx01 + c] +
              u * v * src[idx11 + c];
            dst[targetIdx + c] = val;
          }
        }
      }
    }

    ctx.putImageData(targetData, minX, minY);
  }

  /**
   * Automatic Face Slimming: applies gentle bilateral inward compression
   * to the lower third of the face (jawline & cheeks).
   */
  static autoSlimFace(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 0.35 // 0.0 to 1.0
  ) {
    if (intensity <= 0) return;

    // Approximate facial center and jawline coordinates
    // In full pipeline, these anchor to MediaPipe FaceMesh landmarks (indices 234, 454, 152)
    const centerX = width * 0.5;
    const jawY = height * 0.62;
    const cheekY = height * 0.52;
    const faceRadius = width * 0.28;

    const leftCheekX = centerX - faceRadius * 0.75;
    const rightCheekX = centerX + faceRadius * 0.75;

    const pushDist = faceRadius * 0.12 * intensity;

    // Left jaw push inward
    this.applyPush(
      ctx,
      width,
      height,
      leftCheekX,
      jawY,
      leftCheekX + pushDist,
      jawY - pushDist * 0.2,
      faceRadius * 0.6,
      intensity * 0.7
    );

    // Right jaw push inward
    this.applyPush(
      ctx,
      width,
      height,
      rightCheekX,
      jawY,
      rightCheekX - pushDist,
      jawY - pushDist * 0.2,
      faceRadius * 0.6,
      intensity * 0.7
    );

    // Left cheekbone contour
    this.applyPush(
      ctx,
      width,
      height,
      leftCheekX + faceRadius * 0.1,
      cheekY,
      leftCheekX + faceRadius * 0.1 + pushDist * 0.7,
      cheekY,
      faceRadius * 0.5,
      intensity * 0.5
    );

    // Right cheekbone contour
    this.applyPush(
      ctx,
      width,
      height,
      rightCheekX - faceRadius * 0.1,
      cheekY,
      rightCheekX - faceRadius * 0.1 - pushDist * 0.7,
      cheekY,
      faceRadius * 0.5,
      intensity * 0.5
    );
  }
}
