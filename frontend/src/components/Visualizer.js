import { useRef, useEffect } from 'react';

export const Visualizer = ({ analyser }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 48;
      const step = Math.floor(bufferLength / barCount);
      const barW = (w / barCount) * 0.6;
      const gap = (w / barCount) * 0.4;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] / 255;
        const barH = val * h * 0.85 + 2;
        const x = i * (barW + gap);

        const gradient = ctx.createLinearGradient(0, h, 0, h - barH);
        gradient.addColorStop(0, '#06B6D4');
        gradient.addColorStop(0.5, '#7C3AED');
        gradient.addColorStop(1, '#F43F5E');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, h - barH, barW, barH, 2);
        ctx.fill();
      }
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="audio-visualizer"
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
};
