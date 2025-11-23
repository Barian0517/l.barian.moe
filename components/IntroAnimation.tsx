import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

// ==========================================
// 1. 高科技背景 Canvas (Matrix Code Rain)
// ==========================================
const MatrixBackground = ({ mode }: { mode: 'normal' | 'access' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 12; // 更細緻的字體
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      // 殘影效果
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF";
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Colors based on mode
        if (mode === 'access') ctx.fillStyle = '#22d3ee'; // Cyan
        else ctx.fillStyle = '#00ff41'; // Green/White default

        if (Math.random() > 0.98) ctx.fillStyle = '#fff';
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, [mode]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-20" />;
};

// ==========================================
// 2. 主動畫元件
// ==========================================
const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  // Stages: Clock -> Login (Input) -> Loading -> Access (Success) -> Message -> Finish
  const [stage, setStage] = useState<'clock' | 'login' | 'loading' | 'access' | 'message' | 'finish'>('clock');
  const [time, setTime] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [messageTyped, setMessageTyped] = useState('');
  
  // Skip Logic
  const [showSkipHint, setShowSkipHint] = useState(false);
  const handleInteraction = () => {
    if (!showSkipHint) {
        setShowSkipHint(true);
    } else {
        onComplete();
    }
  };

  useEffect(() => {
    const handleKeyDown = () => handleInteraction();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSkipHint, onComplete]);

  // Sequence Controller
  useEffect(() => {
    // Timeline Constants
    const LOGIN_START = 2500;
    const LOADING_START = 4500;
    const ACCESS_START = 6000;
    const MESSAGE_START = 7500;
    
    // Typing Duration Calculation:
    // Text: "你在看我嗎?" (6 chars)
    // Speed: 800ms interval
    // Duration: 6 * 800ms = 4800ms
    // Message End: 7500 + 4800 = 12300ms
    // Buffer: +700ms for reading = 13000ms
    const FINISH_START = 13000;
    const COMPLETE_TIME = 13500;

    // 1. Clock (0 -> 2.5s)
    const t1 = setTimeout(() => setStage('login'), LOGIN_START);
    
    // 2. Login (Typing: 2.5s -> 4.5s) -> Loading (4.5s -> 6.0s)
    const t2 = setTimeout(() => setStage('loading'), LOADING_START); 

    // 3. Loading -> Access (Success) (6.0s -> 7.5s)
    const t3 = setTimeout(() => {
        setStage('access');
    }, ACCESS_START);

    // 4. Access -> Message (Starts at 7.5s)
    const t4 = setTimeout(() => setStage('message'), MESSAGE_START);

    // 5. Message -> Finish (Starts after typing completes)
    const t5 = setTimeout(() => setStage('finish'), FINISH_START);

    // 6. Complete (Unmount)
    const t6 = setTimeout(onComplete, COMPLETE_TIME);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); 
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
    };
  }, [onComplete]);

  // Clock Logic
  useEffect(() => {
    if (stage !== 'clock') return;
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const i = setInterval(updateTime, 1000);
    return () => clearInterval(i);
  }, [stage]);

  // Password Typing Animation
  useEffect(() => {
    if (stage !== 'login') return;
    let current = '';
    const target = '********';
    let i = 0;
    const interval = setInterval(() => {
      if (i < target.length) {
        current += '*';
        setPasswordInput(current);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [stage]);

  // Message Typing Animation
  useEffect(() => {
    if (stage !== 'message') return;
    
    const target = "你在看我嗎?";
    let i = 0;
    setMessageTyped(''); // Reset
    
    // Slowed down to 800ms per character as requested
    const interval = setInterval(() => {
        if (i < target.length) {
            const char = target.charAt(i);
            setMessageTyped(prev => prev + char);
            i++;
        } else {
            clearInterval(interval);
        }
    }, 800); 

    return () => clearInterval(interval);
  }, [stage]);

  // Helper to determine current interface color
  const getThemeColor = () => {
      if (stage === 'loading') return 'text-cyan-400 stroke-cyan-400 border-cyan-400';
      if (stage === 'access') return 'text-cyan-400 stroke-cyan-400 border-cyan-400';
      return 'text-white stroke-white border-white';
  };
  
  const getGlowEffect = () => {
      if (stage === 'loading') return 'drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]';
      if (stage === 'access') return 'drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]';
      return 'drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]';
  };

  return (
    <motion.div 
      onClick={handleInteraction}
      className="fixed inset-0 z-[100] bg-[#050505] text-white font-mono overflow-hidden flex flex-col items-center justify-center cursor-pointer"
      exit={{ 
          opacity: 0, 
          scale: 1.5, 
          filter: "blur(50px)", 
          transition: { duration: 0.8, ease: "easeInOut" } 
      }}
    >
      {/* Visual Overlays */}
      <div className="absolute inset-0 z-[10] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
      <div className="absolute inset-0 z-[10] pointer-events-none bg-radial-gradient-center from-transparent to-black/80" />

      {/* Background */}
      {stage !== 'finish' && (
        <MatrixBackground mode={(stage === 'access' || stage === 'loading') ? 'access' : 'normal'} />
      )}

      {/* Main Content Area */}
      <div className="relative z-30 w-full h-full flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
            
          {/* STAGE 1: CLOCK */}
          {stage === 'clock' && (
            <motion.div
              key="clock"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, filter: "blur(10px)" }}
              className="flex items-center gap-8"
            >
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-gray-500 animate-pulse">≫ SYSTEM_INIT</span>
              <span className="text-4xl md:text-6xl font-bold text-gray-100 tracking-widest font-[monospace] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {time}
              </span>
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-gray-500 animate-pulse">INIT ≪</span>
            </motion.div>
          )}

          {/* STAGE 2-3: UNIFIED LOGIN INTERFACE (Login -> Loading -> Access) */}
          {['login', 'loading', 'access'].includes(stage) && (
            <motion.div
              key="login-ui"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              className="relative w-full max-w-4xl aspect-video flex items-center justify-center"
            >
                {/* Vertical Dotted Lines (Far Left & Right) - Color shifts */}
                <div className="absolute left-8 top-[10%] bottom-[10%] w-px flex flex-col justify-between opacity-40">
                    {[...Array(45)].map((_, i) => <div key={`l-${i}`} className={`w-[1.5px] h-[1.5px] rounded-full transition-colors duration-300 ${['access', 'loading'].includes(stage) ? 'bg-cyan-400' : 'bg-white'}`} />)}
                </div>
                <div className="absolute right-8 top-[10%] bottom-[10%] w-px flex flex-col justify-between opacity-40">
                    {[...Array(45)].map((_, i) => <div key={`r-${i}`} className={`w-[1.5px] h-[1.5px] rounded-full transition-colors duration-300 ${['access', 'loading'].includes(stage) ? 'bg-cyan-400' : 'bg-white'}`} />)}
                </div>

                {/* Left Bracket */}
                <div className="absolute left-[12%] top-1/2 -translate-y-1/2 w-36 h-56 hidden md:block">
                    <svg className={`w-full h-full overflow-visible transition-all duration-300 ${getThemeColor()}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path 
                            d="M -30,0 L 70,0 L 100,30 L 100,70 L 70,100 L -30,100" 
                            fill="none" 
                            strokeWidth="1.2"
                            className={`opacity-90 transition-all duration-300 ${getGlowEffect()}`}
                        />
                    </svg>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 text-right">
                         <span className={`text-[10px] tracking-[0.3em] font-bold flex items-center gap-2 justify-end transition-colors duration-300 ${['access', 'loading'].includes(stage) ? 'text-cyan-400' : 'text-white'}`}>
                            <span className="text-sm">≫</span> 
                            {['access', 'loading'].includes(stage) ? 'AUTH' : 'LOGIN'}
                         </span>
                    </div>
                </div>

                {/* Right Bracket */}
                <div className="absolute right-[12%] top-1/2 -translate-y-1/2 w-36 h-56 hidden md:block">
                    <svg className={`w-full h-full overflow-visible transition-all duration-300 ${getThemeColor()}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                         <path 
                            d="M 130,0 L 30,0 L 0,30 L 0,70 L 30,100 L 130,100" 
                            fill="none" 
                            strokeWidth="1.2"
                            className={`opacity-90 transition-all duration-300 ${getGlowEffect()}`}
                        />
                    </svg>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 text-left">
                         <span className={`text-[10px] tracking-[0.3em] font-bold flex items-center gap-2 transition-colors duration-300 ${['access', 'loading'].includes(stage) ? 'text-cyan-400' : 'text-white'}`}>
                            {['access', 'loading'].includes(stage) ? 'AUTH' : 'LOGIN'}
                            <span className="text-sm">≪</span>
                         </span>
                    </div>
                </div>

                {/* Center Content Area (Changes based on stage) */}
                <div className="flex flex-col gap-5 w-72 md:w-80 z-10 justify-center h-40">
                    
                    {/* STATE: LOGIN INPUTS */}
                    {stage === 'login' && (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex flex-col gap-5">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:3px_3px] opacity-20" />
                                <div className="relative flex items-center justify-between px-3 py-2">
                                    <span className="text-white text-xs font-bold tracking-widest mr-2">Account &gt;</span>
                                    <div className="flex gap-1 text-gray-400 tracking-[0.3em] text-xs font-mono">BARIAN</div>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:3px_3px] opacity-20" />
                                <div className="relative flex items-center justify-between px-3 py-2">
                                    <span className="text-white text-xs font-bold tracking-widest mr-2">Password &gt;</span>
                                    <div className="flex items-center gap-1 justify-end">
                                        <span className="text-gray-200 tracking-[0.3em] text-xs font-mono min-h-[20px]">{passwordInput}</span>
                                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-3 bg-white block ml-1" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: LOADING */}
                    {stage === 'loading' && (
                        <motion.div 
                            initial={{opacity: 0}} 
                            animate={{opacity: 1}} 
                            exit={{opacity: 0}} 
                            className="flex flex-col items-center justify-center gap-4"
                        >
                            <div className="relative w-12 h-12">
                                {/* Outer Ring */}
                                <motion.div 
                                    className="absolute inset-0 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                                />
                                {/* Inner Ring */}
                                <motion.div 
                                    className="absolute inset-2 border-2 border-cyan-500/30 border-b-cyan-400 rounded-full"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                />
                            </div>
                            <div className="text-xs text-cyan-400 tracking-[0.3em] animate-pulse">VERIFYING...</div>
                        </motion.div>
                    )}

                    {/* STATE: ACCESS GRANTED */}
                    {stage === 'access' && (
                         <motion.div 
                            initial={{opacity: 0, scale: 0.8}} 
                            animate={{opacity: 1, scale: 1}} 
                            exit={{opacity: 0}} 
                            className="flex flex-col items-center justify-center gap-2"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] text-center">
                                ACCESS<br/>GRANTED
                            </h2>
                            <div className="w-full h-[2px] bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                            <div className="text-[10px] text-cyan-200 tracking-[0.5em] animate-pulse">WELCOME USER</div>
                         </motion.div>
                    )}

                </div>
            </motion.div>
          )}

          {/* STAGE 5: MESSAGE */}
          {stage === 'message' && (
            <motion.div
              key="message"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative z-50 flex flex-col items-center"
            >
                {/* Use font-sans to ensure Chinese characters (like '在') render correctly. 
                    Added min-height to prevent layout shifts. */}
                <h1 className="text-2xl md:text-4xl font-normal tracking-[0.5em] text-white drop-shadow-[0_0_10px_white] text-center mix-blend-screen font-sans min-h-[48px]">
                    {messageTyped}
                    <span className="animate-pulse inline-block w-3 h-8 align-middle bg-white ml-2"/>
                </h1>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* SKIP HINT OVERLAY */}
      {showSkipHint && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute bottom-8 z-[200] text-gray-500 text-[10px] tracking-[0.3em] font-bold animate-pulse"
          >
            [ PRESS ANY KEY OR TAP TO SKIP ]
          </motion.div>
      )}
    </motion.div>
  );
};

export default IntroAnimation;