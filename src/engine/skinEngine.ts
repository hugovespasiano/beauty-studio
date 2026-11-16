/**
 * Beauty Studio - Skin Retouch & Pore Smoothing Engine
 * High-performance edge-preserving smoothing filter (Bilateral Filter Approximation)
 * Smoothes blemishes and texture without blurring eyes, lips, or hair strands.
 */

export class SkinEngine {
  /**
   * Applies an edge-preserving skin softening filter to the canvas context.
   * @param ctx Target canvas 2D context
   * @param width Canvas width
   * @param height Canvas height
   * @param smoothing 0.0 to 1.0 (smoothness intensity)
   * @param brightnessBoost -0.5 to 0.5 (subtle skin glow / luminance)
   */
  static applySkinSmoothing(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    smoothing: number = 0.4,
    brightnessBoost: number = 0.05
  ) {
    if (smoothing <= 0 && brightnessBoost === 0) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const output = ctx.createImageData(width, height);
    const outData = output.data;

    // Fast selective bilateral smoothing:
    // Radius of neighborhood
    const radius = Math.max(1, Math.round(2 + smoothing * 4));
    // Color difference threshold (in RGB space). Edges larger than this are preserved.
    const threshold = 18 + (1 - smoothing) * 15;
    const threshSq = threshold * threshold;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerIdx = (y * width + x) * 4;
        const cr = data[centerIdx];
        const cg = data[centerIdx + 1];
        const cb = data[centerIdx + 2];
        const ca = data[centerIdx + 3];

        // Is this pixel roughly skin-colored? (RGB skin heuristic in YCbCr/RGB)
        // r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 10
        const isSkinLike = cr > 55 && cg > 35 && cr > cg && (cr - cb) > 10;

        if (!isSkinLike || smoothing <= 0) {
          outData[centerIdx] = cr;
          outData[centerIdx + 1] = cg;
          outData[centerIdx + 2] = cb;
          outData[centerIdx + 3] = ca;
          continue;
        }

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let totalWeight = 0;

        // Sample local neighborhood
        for (let dy = -radius; dy <= radius; dy += 2) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;

          for (let dx = -radius; dx <= radius; dx += 2) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;

            const nIdx = (ny * width + nx) * 4;
            const nr = data[nIdx];
            const ng = data[nIdx + 1];
            const nb = data[nIdx + 2];

            // Color distance
            const dr = nr - cr;
            const dg = ng - cg;
            const db = nb - cb;
            const colorDistSq = dr * dr + dg * dg + db * db;

            // Only average if color difference is below the threshold (preserves pores vs sharp edges)
            if (colorDistSq < threshSq) {
              const weight = 1 - colorDistSq / threshSq;
              sumR += nr * weight;
              sumG += ng * weight;
              sumB += nb * weight;
              totalWeight += weight;
            }
          }
        }

        if (totalWeight > 0) {
          const avgR = sumR / totalWeight;
          const avgG = sumG / totalWeight;
          const avgB = sumB / totalWeight;

          // Blend smoothed result with original based on smoothing intensity
          const blend = smoothing * 0.85;
          let finalR = cr * (1 - blend) + avgR * blend;
          let finalG = cg * (1 - blend) + avgG * blend;
          let finalB = cb * (1 - blend) + avgB * blend;

          // Subtle brightness / glow
          if (brightnessBoost > 0) {
            finalR = Math.min(255, finalR * (1 + brightnessBoost * 0.6));
            finalG = Math.min(255, finalG * (1 + brightnessBoost * 0.6));
            finalB = Math.min(255, finalB * (1 + brightnessBoost * 0.6));
          }

          outData[centerIdx] = finalR;
          outData[centerIdx + 1] = finalG;
          outData[centerIdx + 2] = finalB;
          outData[centerIdx + 3] = ca;
        } else {
          outData[centerIdx] = cr;
          outData[centerIdx + 1] = cg;
          outData[centerIdx + 2] = cb;
          outData[centerIdx + 3] = ca;
        }
      }
    }

    ctx.putImageData(output, 0, 0);
  }
}
