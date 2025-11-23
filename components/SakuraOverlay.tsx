import React, { useEffect, useRef } from 'react';

interface SakuraConfig {
  count: number;      // Number of petals
  baseSize: number;   // Average size
  baseSpeed: number;  // Vertical fall speed
  rotationSpeed: number; // How fast they spin around the center
  color: string;
}

const DEFAULT_CONFIG: SakuraConfig = {
  count: 100,         // Increased density for better whirlwind effect
  baseSize: 14,
  baseSpeed: 1.5,
  rotationSpeed: 0.01,
  color: '#ffb7b2', // Sakura Pink
};

class Petal {
  x: number = 0;
  y: number = 0;
  
  // Physics properties
  radius: number = 0; // Distance from center vortex
  theta: number = 0; // Angle around center
  phi: number = 0;   // Tilt of the petal itself
  
  size: number = 0;
  speedY: number = 0;
  omega: number = 0; // Angular velocity
  
  canvasWidth: number = 0;
  canvasHeight: number = 0;

  constructor(width: number, height: number, config: SakuraConfig) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.reset(true, config);
  }

  reset(initial: boolean, config: SakuraConfig) {
    // Randomize position
    this.theta = Math.random() * Math.PI * 2;
    
    // Radius: Spiraling outwards or keeping a cylinder. 
    // To make it wrap the content (max width ~700px), we want radius ample enough to go around content
    const minRadius = 300; 
    const maxRadius = Math.max(this.canvasWidth / 2, 700);
    this.radius = minRadius + Math.random() * (maxRadius - minRadius);

    if (initial) {
      this.y = Math.random() * this.canvasHeight;
    } else {
      this.y = -50; // Start above screen
    }

    this.size = config.baseSize * (0.6 + Math.random() * 0.8);
    this.speedY = config.baseSpeed * (0.8 + Math.random() * 1.2);
    
    // Clockwise rotation
    this.omega = config.rotationSpeed * (0.8 + Math.random() * 0.4); 
    
    this.phi = Math.random() * Math.PI * 2;
  }

  update(config: SakuraConfig) {
    this.y += this.speedY;
    this.theta += this.omega;
    this.phi += 0.02; // Petal self-rotation

    // Reset if out of bounds
    if (this.y > this.canvasHeight + 50) {
      this.reset(false, config);
    }
  }

  draw(backCtx: CanvasRenderingContext2D, frontCtx: CanvasRenderingContext2D) {
    // Calculate 3D position
    const cx = this.canvasWidth / 2;
    
    // Axis tilt: Strong Top-Left to Bottom-Right Diagonal
    // At Top (y=0), shift Left (-200). At Bottom (y=height), shift Right (+200)
    const axisTilt = (this.y / this.canvasHeight) * 600 - 300; 

    const x3d = Math.cos(this.theta) * this.radius;
    const z3d = Math.sin(this.theta) * this.radius; // Depth: Negative is back, Positive is front
    
    // Project to 2D
    // Z influences scale and opacity
    const scale = 1 + z3d / 1500; // Perspective scale
    const alpha = 0.6 + (z3d / 3000); // Fade when in back

    const screenX = cx + x3d + axisTilt;
    const screenY = this.y;

    // Select Context based on depth
    // If z3d < 0, it's behind the center plane (Back Canvas)
    // If z3d >= 0, it's in front (Front Canvas)
    const ctx = z3d < 0 ? backCtx : frontCtx;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(scale, scale);
    ctx.rotate(this.phi); // Rotate petal itself
    
    // Draw Petal
    ctx.globalAlpha = Math.max(0.2, Math.min(1, alpha));
    ctx.fillStyle = DEFAULT_CONFIG.color;
    
    ctx.beginPath();
    // Draw a simple petal shape
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, -this.size / 5, 0, this.size);
    ctx.bezierCurveTo(-this.size, -this.size / 5, -this.size / 2, -this.size / 2, 0, 0);
    ctx.fill();

    ctx.restore();
  }
}

const SakuraOverlay: React.FC = () => {
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);

  useEffect(() => {
    const backCanvas = backCanvasRef.current;
    const frontCanvas = frontCanvasRef.current;
    if (!backCanvas || !frontCanvas) return;

    const backCtx = backCanvas.getContext('2d');
    const frontCtx = frontCanvas.getContext('2d');
    if (!backCtx || !frontCtx) return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      backCanvas.width = w;
      backCanvas.height = h;
      frontCanvas.width = w;
      frontCanvas.height = h;
      
      // Re-init petals on drastic resize or just update bounds
      if (petalsRef.current.length === 0) {
        for (let i = 0; i < DEFAULT_CONFIG.count; i++) {
          petalsRef.current.push(new Petal(w, h, DEFAULT_CONFIG));
        }
      } else {
          petalsRef.current.forEach(p => {
              p.canvasWidth = w;
              p.canvasHeight = h;
          });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      backCtx.clearRect(0, 0, backCanvas.width, backCanvas.height);
      frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
      
      petalsRef.current.forEach(petal => {
        petal.update(DEFAULT_CONFIG);
        // Draw to appropriate canvas based on depth calculation inside draw
        petal.draw(backCtx, frontCtx);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
        {/* Back Layer: Between Background and Content (z-index: 5) */}
        <canvas
            ref={backCanvasRef}
            className="fixed inset-0 z-[5] pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />
        {/* Front Layer: Top of everything (z-index: 60) */}
        <canvas
            ref={frontCanvasRef}
            className="fixed inset-0 z-[60] pointer-events-none"
            style={{ width: '100%', height: '100%' }}
        />
    </>
  );
};

export default SakuraOverlay;