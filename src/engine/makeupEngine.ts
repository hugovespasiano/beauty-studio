/**
 * Beauty Studio - Virtual Makeup, Teeth Whitening & Eye Care Engine
 * 100% on-device realistic cosmetics blending.
 */

export interface LipColor {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

export const LIPSTICK_PALETTE: LipColor[] = [
  { name: 'Nude Rosé', hex: '#c97a7e', r: 201, g: 122, b: 126 },
  { name: 'Vermelho Clássico', hex: '#b91c1c', r: 185, g: 28, b: 28 },
  { name: 'Vinho Tinto', hex: '#831843', r: 131, g: 24, b: 67 },
  { name: 'Coral Suave', hex: '#e07a5f', r: 224, g: 122, b: 95 },
  { name: 'Rosa Chiclete', hex: '#db2777', r: 219, g: 39, b: 119 },
  { name: 'Terracota', hex: '#a2553b', r: 162, g: 85, b: 59 },
];

export class MakeupEngine {
  /**
   * Applies realistic lipstick overlay to lips area.
   */
  static applyLipstick(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color: LipColor,
    intensity: number = 0.5,
    isGloss: boolean = false
  ) {
    if (intensity <= 0) return;

    // Approximate lips region centered on face
    const centerX = width * 0.5;
    const centerY = height * 0.53;
    const lipY = centerY + height * 0.18;
    const lipWidth = width * 0.16;
    const lipHeight = height * 0.055;

    const minX = Math.max(0, Math.floor(centerX - lipWidth));
    const maxX = Math.min(width, Math.ceil(centerX + lipWidth));
    const minY = Math.max(0, Math.floor(lipY - lipHeight));
    const maxY = Math.min(height, Math.ceil(lipY + lipHeight));

    const w = maxX - minX;
    const h = maxY - minY;
    if (w <= 0 || h <= 0) return;

    const imgData = ctx.getImageData(minX, minY, w, h);
    const data = imgData.data;

    for (let y = 0; y < h; y++) {
      const curY = minY + y;
      const dy = (curY - lipY) / lipHeight;
      for (let x = 0; x < w; x++) {
        const curX = minX + x;
        const dx = (curX - centerX) / lipWidth;
        const distSq = dx * dx + dy * dy;

        // Elliptical falloff for lips
        if (distSq < 1.0) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Lip mask heuristic (lips are redder than surrounding skin)
          const lipWeight = Math.pow(1.0 - distSq, 1.5) * intensity;

          // Soft light blend mode
          const blendR = (r * color.r) / 255;
          const blendG = (g * color.g) / 255;
          const blendB = (b * color.b) / 255;

          data[idx] = Math.min(255, r * (1 - lipWeight) + blendR * lipWeight * 1.5);
          data[idx + 1] = Math.min(255, g * (1 - lipWeight) + blendG * lipWeight * 1.5);
          data[idx + 2] = Math.min(255, b * (1 - lipWeight) + blendB * lipWeight * 1.5);

          // Add gloss shine
          if (isGloss && Math.abs(dy) < 0.3 && Math.abs(dx) < 0.4) {
            const glossFactor = (1 - Math.abs(dx) / 0.4) * 35;
            data[idx] = Math.min(255, data[idx] + glossFactor);
            data[idx + 1] = Math.min(255, data[idx + 1] + glossFactor);
            data[idx + 2] = Math.min(255, data[idx + 2] + glossFactor);
          }
        }
      }
    }

    ctx.putImageData(imgData, minX, minY);
  }

  /**
   * Applies Teeth Whitening (removes yellow cast and lifts brightness on teeth)
   */
  static applyTeethWhitening(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 0.5
  ) {
    if (intensity <= 0) return;

    const centerX = width * 0.5;
    const centerY = height * 0.53;
    const mouthY = centerY + height * 0.175;
    const mouthW = width * 0.1;
    const mouthH = height * 0.035;

    const minX = Math.max(0, Math.floor(centerX - mouthW));
    const maxX = Math.min(width, Math.ceil(centerX + mouthW));
    const minY = Math.max(0, Math.floor(mouthY - mouthH));
    const maxY = Math.min(height, Math.ceil(mouthY + mouthH));

    const w = maxX - minX;
    const h = maxY - minY;
    if (w <= 0 || h <= 0) return;

    const imgData = ctx.getImageData(minX, minY, w, h);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Identify tooth pixels: high luminance, slight yellow tint (r > 120, g > 110, b > 90)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 115 && r > b && g > b) {
        // Desaturate yellow (boost blue channel towards white)
        const yellowCast = Math.min(r, g) - b;
        if (yellowCast > 5) {
          const boostB = yellowCast * 0.65 * intensity;
          const boostLum = 18 * intensity;
          data[i] = Math.min(255, r + boostLum);
          data[i + 1] = Math.min(255, g + boostLum);
          data[i + 2] = Math.min(255, b + boostB + boostLum);
        }
      }
    }

    ctx.putImageData(imgData, minX, minY);
  }

  /**
   * Anti-Dark Circles (Clareamento da área inferior dos olhos)
   */
  static applyEyeBagsRemoval(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 0.4
  ) {
    if (intensity <= 0) return;

    const eyeY = height * 0.42;
    const leftEyeX = width * 0.415;
    const rightEyeX = width * 0.585;
    const radius = width * 0.07;

    const bags = [
      { x: leftEyeX, y: eyeY + height * 0.035 },
      { x: rightEyeX, y: eyeY + height * 0.035 }
    ];

    bags.forEach((bag) => {
      const minX = Math.max(0, Math.floor(bag.x - radius));
      const maxX = Math.min(width, Math.ceil(bag.x + radius));
      const minY = Math.max(0, Math.floor(bag.y - radius * 0.6));
      const maxY = Math.min(height, Math.ceil(bag.y + radius * 0.6));

      const w = maxX - minX;
      const h = maxY - minY;
      if (w <= 0 || h <= 0) return;

      const imgData = ctx.getImageData(minX, minY, w, h);
      const data = imgData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const curX = minX + x;
          const curY = minY + y;
          const dx = (curX - bag.x) / radius;
          const dy = (curY - bag.y) / (radius * 0.6);
          const dSq = dx * dx + dy * dy;

          if (dSq < 1.0) {
            const factor = Math.pow(1 - dSq, 2) * intensity;
            const idx = (y * w + x) * 4;

            // Lift darker shadows and reduce purple/blue undertones
            data[idx] = Math.min(255, data[idx] + 25 * factor);
            data[idx + 1] = Math.min(255, data[idx + 1] + 20 * factor);
            data[idx + 2] = Math.min(255, data[idx + 2] + 12 * factor);
          }
        }
      }

      ctx.putImageData(imgData, minX, minY);
    });
  }

  /**
   * Generates a side-by-side Before & After comparison card for Instagram Stories/Feed
   */
  static generateInstagramBeforeAfter(
    originalCanvas: HTMLCanvasElement,
    editedCanvas: HTMLCanvasElement
  ): string {
    const width = 1080;
    const height = 1350; // Standard 4:5 Instagram Portrait
    const card = document.createElement('canvas');
    card.width = width;
    card.height = height;
    const ctx = card.getContext('2d')!;

    // Luxury Studio background
    ctx.fillStyle = '#0f1117';
    ctx.fillRect(0, 0, width, height);

    // Two panels
    const halfWidth = width / 2 - 4;

    // Draw original on left
    ctx.drawImage(originalCanvas, 0, 0, halfWidth, height - 120);

    // Draw edited on right
    ctx.drawImage(editedCanvas, width / 2 + 4, 0, halfWidth, height - 120);

    // Divider line
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height - 120);
    ctx.stroke();

    // Badges
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(40, 40, 160, 50);
    ctx.fillRect(width / 2 + 40, 40, 160, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANTES', 120, 72);
    ctx.fillText('DEPOIS', width / 2 + 120, 72);

    // Footer Studio Branding
    ctx.fillStyle = '#181b24';
    ctx.fillRect(0, height - 120, width, 120);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('✨ BEAUTY STUDIO PRO', width / 2, height - 65);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px sans-serif';
    ctx.fillText('Procedimento Estético & Retoque Natural', width / 2, height - 35);

    return card.toDataURL('image/png', 1.0);
  }
}
