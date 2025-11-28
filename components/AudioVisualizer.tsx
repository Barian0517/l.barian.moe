import React, { useEffect, useRef } from 'react';

// ==========================================
// 音頻律動配置 (VISUALIZER CONFIGURATION)
// 請在此處調整參數以改變律動條的外觀
// ==========================================
const VISUALIZER_CONFIG = {
  // 5. 形式: 'circular' (圓形) | 'linear' (直線)
  mode: 'circular' as 'linear' | 'circular', 

  // 1. 角度: 圓形的起始旋轉角度 (0-360度)。僅在 mode='circular' 時有效。
  //    控制第一個律動條從圓的哪個位置開始長。
  angle: 0, 

  // 2. 幅度: 律動條跳動的幅度倍率 (建議 1.0 ~ 3.0)
  //    數值越大，對聲音越敏感，跳得越高。
  amplitude: 1.5,

  // 3. 數量: 律動條的數量 (密集程度)
  //    圓形建議 80-150，直線建議 60-120 (視寬度而定)
  count: 100,

  // 4. 寬度: 每一條律動條的寬度比例 (0.1 ~ 1.0)
  //    數值越小越細，間隙越大；1.0 為無間隙。
  width: 0.5,

  // 6. 位置: 律動條的中心點位置 (螢幕百分比 0-100)
  //    x: 水平位置 (50 為正中間), y: 垂直位置 (50 為正中間)
  //    例如直線模式想放在底部，可設為 { x: 50, y: 90 }
  position: { x: 50, y: 60 },

  // 7. 大小: 整體縮放比例 (建議 0.5 ~ 2.0)
  //    控制圓形的半徑或直線的總寬度/高度
  scale: 1.0, 
};

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const initAudio = () => {
      const audio = document.querySelector('audio');
      if (!audio) return;

      // Enable CORS for audio analysis
      if (!audio.crossOrigin) {
        audio.crossOrigin = "anonymous";
      }

      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }

      const actx = audioContextRef.current;
      
      // Resume context on interaction
      if (actx.state === 'suspended') {
        const resume = () => {
             actx.resume();
             ['click', 'touchstart', 'keydown'].forEach(e => 
                document.removeEventListener(e, resume)
             );
        };
        ['click', 'touchstart', 'keydown'].forEach(e => 
          document.addEventListener(e, resume)
        );
      }

      if (!analyserRef.current) {
        analyserRef.current = actx.createAnalyser();
        analyserRef.current.fftSize = 512; // Higher resolution for smoother bars
        analyserRef.current.smoothingTimeConstant = 0.8;
      }

      if (!sourceRef.current) {
        try {
          sourceRef.current = actx.createMediaElementSource(audio);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(actx.destination);
        } catch (e) {
          // Ignore errors if source already connected
        }
      }
    };

    // Poll for audio element
    const pollInterval = setInterval(() => {
        if (document.querySelector('audio') && !sourceRef.current) {
            initAudio();
        }
    }, 1000);

    const render = () => {
      if (!analyserRef.current || !ctx) {
          requestRef.current = requestAnimationFrame(render);
          return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      
      // 6. Calculate Position from Config
      const cx = w * (VISUALIZER_CONFIG.position.x / 100);
      const cy = h * (VISUALIZER_CONFIG.position.y / 100);

      ctx.clearRect(0, 0, w, h);

      // Common Style
      const bars = VISUALIZER_CONFIG.count;
      // Map bars to frequency range (skip high frequencies that are often empty)
      const dataStep = Math.floor((bufferLength * 0.7) / bars); 

      // 7. Base Size / Radius
      const minDim = Math.min(w, h);

      if (VISUALIZER_CONFIG.mode === 'circular') {
        // === CIRCULAR MODE ===
        const radius = minDim * 0.25 * VISUALIZER_CONFIG.scale;
        
        // 4. Calculate Bar Width based on circumference
        const circumference = 2 * Math.PI * radius;
        const barWidth = (circumference / bars) * VISUALIZER_CONFIG.width;

        // 1. Rotation Offset
        const startAngle = (VISUALIZER_CONFIG.angle * Math.PI) / 180;
        
        // Auto-rotation animation (slow drift)
        const timeRotation = Date.now() * 0.0001; 

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + timeRotation);

        for (let i = 0; i < bars; i++) {
            const dataIndex = i * dataStep;
            const value = dataArray[dataIndex] || 0;

            // 2. Amplitude Calculation
            const maxBarHeight = minDim * 0.3; // Max limit relative to screen
            const barHeight = Math.max(4, (value / 255) * maxBarHeight * VISUALIZER_CONFIG.amplitude);

            const angle = (i / bars) * Math.PI * 2;

            ctx.save();
            ctx.rotate(angle);

            // Draw Bar
            drawBar(ctx, 0, radius, barWidth, barHeight, value);
            
            ctx.restore();
        }
        
        // Inner Glow Ring
        ctx.beginPath();
        ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

      } else {
        // === LINEAR MODE ===
        const totalWidth = w * 0.8 * VISUALIZER_CONFIG.scale; // 80% screen width at scale 1
        const startX = cx - totalWidth / 2;
        const barSpacing = totalWidth / bars;
        const barWidth = barSpacing * VISUALIZER_CONFIG.width;

        for (let i = 0; i < bars; i++) {
            const dataIndex = i * dataStep;
            const value = dataArray[dataIndex] || 0;

            // 2. Amplitude
            const maxBarHeight = h * 0.4; 
            const barHeight = Math.max(4, (value / 255) * maxBarHeight * VISUALIZER_CONFIG.amplitude);
            
            const x = startX + i * barSpacing;
            // Draw growing upwards from cy
            const y = cy; 

            ctx.save();
            // Gradient Logic
            const gradient = ctx.createLinearGradient(0, y, 0, y - barHeight);
            gradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)'); 
            gradient.addColorStop(0.6, 'rgba(34, 211, 238, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;

            // Draw Rect (Simple rect for linear usually looks cleaner than rounded for spectrums)
            // But let's use rounded top for style
            roundRect(ctx, x, y - barHeight, barWidth, barHeight, barWidth/2);
            ctx.fill();

            // Reflection (Optional: faint mirror below)
            /*
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
            ctx.fillRect(x, y, barWidth, barHeight * 0.3);
            ctx.globalAlpha = 1.0;
            */

            // Particle at tip
            if (value > 100) {
                 ctx.beginPath();
                 ctx.fillStyle = `rgba(255, 255, 255, ${(value - 100) / 255})`;
                 ctx.arc(x + barWidth/2, y - barHeight - 4, 2, 0, Math.PI * 2);
                 ctx.fill();
            }

            ctx.restore();
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    // Helper to draw the styled bar
    function drawBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, value: number) {
        // Gradient: Purple -> Cyan -> Transparent
        const gradient = ctx.createLinearGradient(0, y, 0, y + h);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)'); // Purple Base
        gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.5)'); // Cyan Mid
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');   // Fade Tip

        ctx.fillStyle = gradient;

        // Centered on angle (x - w/2)
        roundRect(ctx, x - w / 2, y, w, h, w / 2);
        ctx.fill();

        // Particle Tip
        if (value > 80) {
           ctx.beginPath();
           ctx.fillStyle = `rgba(34, 211, 238, ${(value - 80) / 255})`; 
           const particleDist = y + h + 8;
           ctx.arc(0, particleDist, 2.5, 0, Math.PI * 2);
           ctx.fill();
        }
    }

    function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(pollInterval);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[1]"
    />
  );
};

export default AudioVisualizer;