/**
 * Creates a default high-resolution portrait sample image for instant testing
 */
export function createSamplePortraitImage(): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1334;
    const ctx = canvas.getContext('2d')!;

    // Studio portrait background
    const bgGrad = ctx.createLinearGradient(0, 0, 1000, 1334);
    bgGrad.addColorStop(0, '#2d2228');
    bgGrad.addColorStop(0.5, '#1e1b24');
    bgGrad.addColorStop(1, '#111217');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1000, 1334);

    // Warm studio key light
    const radial = ctx.createRadialGradient(500, 500, 50, 500, 500, 700);
    radial.addColorStop(0, 'rgba(255, 210, 190, 0.25)');
    radial.addColorStop(0.6, 'rgba(210, 140, 160, 0.08)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1000, 1334);

    // Hair silhouette
    ctx.fillStyle = '#1c1518';
    ctx.beginPath();
    ctx.ellipse(500, 540, 310, 420, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e8b598';
    ctx.beginPath();
    ctx.rect(430, 750, 140, 300);
    ctx.fill();

    // Shoulders
    ctx.fillStyle = '#26222b';
    ctx.beginPath();
    ctx.ellipse(500, 1150, 450, 260, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face oval
    const faceGrad = ctx.createRadialGradient(480, 540, 30, 500, 560, 260);
    faceGrad.addColorStop(0, '#ffd8c2');
    faceGrad.addColorStop(0.7, '#f4ba99');
    faceGrad.addColorStop(1, '#e29b79');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(500, 580, 205, 265, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks blush
    const blushGrad = ctx.createRadialGradient(380, 620, 10, 380, 620, 80);
    blushGrad.addColorStop(0, 'rgba(235, 90, 120, 0.35)');
    blushGrad.addColorStop(1, 'rgba(235, 90, 120, 0)');
    ctx.fillStyle = blushGrad;
    ctx.beginPath();
    ctx.arc(380, 620, 80, 0, Math.PI * 2);
    ctx.fill();

    const blushGradR = ctx.createRadialGradient(620, 620, 10, 620, 620, 80);
    blushGradR.addColorStop(0, 'rgba(235, 90, 120, 0.35)');
    blushGradR.addColorStop(1, 'rgba(235, 90, 120, 0)');
    ctx.fillStyle = blushGradR;
    ctx.beginPath();
    ctx.arc(620, 620, 80, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(415, 520, 45, 22, -0.05, 0, Math.PI * 2);
    ctx.ellipse(585, 520, 45, 22, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Iris & Pupil
    ctx.fillStyle = '#4a2f23';
    ctx.beginPath();
    ctx.arc(415, 520, 18, 0, Math.PI * 2);
    ctx.arc(585, 520, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(415, 520, 9, 0, Math.PI * 2);
    ctx.arc(585, 520, 9, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(410, 515, 4, 0, Math.PI * 2);
    ctx.arc(580, 515, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#432d25';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(365, 485);
    ctx.quadraticCurveTo(415, 470, 465, 490);
    ctx.moveTo(535, 490);
    ctx.quadraticCurveTo(585, 470, 635, 485);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#d98b69';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(500, 525);
    ctx.lineTo(495, 615);
    ctx.quadraticCurveTo(500, 625, 512, 618);
    ctx.stroke();

    // Lips
    const lipGrad = ctx.createLinearGradient(440, 680, 560, 730);
    lipGrad.addColorStop(0, '#c7445a');
    lipGrad.addColorStop(0.5, '#e65c75');
    lipGrad.addColorStop(1, '#b5334a');
    ctx.fillStyle = lipGrad;
    ctx.beginPath();
    ctx.moveTo(440, 700);
    ctx.quadraticCurveTo(475, 680, 500, 692);
    ctx.quadraticCurveTo(525, 680, 560, 700);
    ctx.quadraticCurveTo(500, 745, 440, 700);
    ctx.fill();

    // Lip highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(500, 712, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair strands & bangs
    ctx.fillStyle = '#22191d';
    ctx.beginPath();
    ctx.moveTo(270, 520);
    ctx.quadraticCurveTo(340, 360, 500, 350);
    ctx.quadraticCurveTo(660, 360, 730, 520);
    ctx.quadraticCurveTo(590, 420, 500, 425);
    ctx.quadraticCurveTo(410, 420, 270, 520);
    ctx.fill();

    // Add a tiny sample beauty mark for Eraser testing
    ctx.fillStyle = '#7a4233';
    ctx.beginPath();
    ctx.arc(630, 680, 5, 0, Math.PI * 2);
    ctx.fill();

    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL('image/jpeg', 0.95);
  });
}
