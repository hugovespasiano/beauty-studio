/**
 * Beauty Studio - Filters & Studio Lighting Engine
 * High-end beauty tones, hair shine, lighting and subtle color enhancement.
 */

export class FiltersEngine {
  /**
   * Applies studio lighting adjustments (warmth, glow, clarity, contrast).
   */
  static applyStudioLighting(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    brightness: number = 0, // -50 to 50
    contrast: number = 0,   // -50 to 50
    warmth: number = 0,     // -50 to 50
    glow: number = 0        // 0 to 50
  ) {
    if (brightness === 0 && contrast === 0 && warmth === 0 && glow === 0) return;

    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    // Contrast factor
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      // Brightness & Contrast
      r = factor * (r - 128) + 128 + brightness;
      g = factor * (g - 128) + 128 + brightness;
      b = factor * (b - 128) + 128 + brightness;

      // Warmth (Golden hour / Rose studio tone)
      if (warmth > 0) {
        r += warmth * 0.5;
        b -= warmth * 0.3;
      } else if (warmth < 0) {
        // Cooler / Nordic clean tone
        r += warmth * 0.3;
        b -= warmth * 0.5;
      }

      // Soft glam highlight glow (lifts mid-tones and highlights)
      if (glow > 0) {
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum > 110) {
          const glowFactor = (lum / 255) * (glow / 100);
          r += (255 - r) * glowFactor;
          g += (245 - g) * glowFactor * 0.9;
          b += (235 - b) * glowFactor * 0.8;
        }
      }

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Applies hair gloss / shine enhancement.
   */
  static applyHairGloss(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 0.3
  ) {
    if (intensity <= 0) return;
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Hair typically resides in dark-to-mid luminance bands; enhance highlights
      if (lum > 30 && lum < 160) {
        const boost = Math.sin((lum / 160) * Math.PI) * intensity * 35;
        d[i] = Math.min(255, r + boost);
        d[i + 1] = Math.min(255, g + boost * 0.95);
        d[i + 2] = Math.min(255, b + boost * 0.9);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }
}
