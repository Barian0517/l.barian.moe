import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './components/GlassCard';
import SocialRow from './components/SocialRow';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import SakuraOverlay from './components/SakuraOverlay';
import IntroAnimation from './components/IntroAnimation';
import AudioVisualizer from './components/AudioVisualizer';
import { PROFILE_DATA, SECTION_IMAGES } from './constants';
import { GameItem } from './types';

// Reusable Info Row Component
const InfoRow = ({ label, value, isList = false }: { label: string, value: string | string[], isList?: boolean }) => (
  <div className="flex flex-col gap-1 mb-4 last:mb-0">
    <span className="text-cyan-200 font-medium text-sm opacity-80 tracking-wider">
      -{label}-
    </span>
    {isList && Array.isArray(value) ? (
      <div className="flex flex-col gap-1">
          {value.map((item, idx) => (
              <span key={idx} className="text-white/90 font-light">{item}</span>
          ))}
      </div>
    ) : (
      <span className="text-white font-medium text-lg tracking-wide whitespace-pre-line">
        {value}
      </span>
    )}
  </div>
);

// Reusable Section Header
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200 mb-6 drop-shadow-sm shimer-text">
    {children}
  </h2>
);

// Render Game/Anime Item helper
const renderCategoryItem = (item: string | GameItem) => {
  if (typeof item === 'string') return <span>{item}</span>;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="font-medium text-white">{item.name}</span>
      {item.description && (
        <span className="text-gray-400 text-sm sm:text-base">{item.description}</span>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <>
        <AnimatePresence mode="wait">
            {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
        </AnimatePresence>

        {!showIntro && (
            <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white selection:bg-cyan-500/30 pb-20 animate-[fadeIn_2s_ease-out]">
            
            {/* Background */}
            <div className="fixed inset-0 z-0">
                {PROFILE_DATA.backgroundType === 'video' ? (
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover transform scale-105"
                  >
                    <source src={PROFILE_DATA.backgroundUrl} type="video/mp4" />
                    <source src={PROFILE_DATA.backgroundUrl} type="video/webm" />
                  </video>
                ) : (
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                    style={{ backgroundImage: `url(${PROFILE_DATA.backgroundUrl})` }}
                  />
                )}
                
                <div className="absolute inset-0 bg-black/60" /> 
                
                {/* Shimmer Animation Style */}
                <style>{`
                    .shimer-text {
                        background-size: 200% auto;
                        animation: shimmer 3s linear infinite;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(1.1); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </div>

            {/* VISUAL EFFECTS OVERLAY */}
            <SakuraOverlay />
            <AudioVisualizer />
            
            {/* FLOATING MUSIC PLAYER */}
            <FloatingMusicPlayer />

            {/* Main Content Scroll */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 flex flex-col items-center gap-8 pt-16">
                
                {/* HEADER */}
                <div className="flex flex-col items-center text-center w-full">
                    {/* Avatar Container */}
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ 
                            scale: 1,
                            y: [0, -10, 0],
                            boxShadow: ["0 0 0 rgba(77,138,255,0)", "0 0 20px rgba(77,138,255,0.4)", "0 0 0 rgba(77,138,255,0)"]
                        }} 
                        whileHover={{ scale: 1.1, rotate: 5, filter: "brightness(1.1)" }}
                        transition={{ 
                            scale: { type: "spring", stiffness: 300, damping: 15 },
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                            boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative p-1 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full cursor-pointer group"
                    >
                        <img 
                            src={PROFILE_DATA.avatarUrl} 
                            alt="Avatar" 
                            className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-[#0f0f0f]"
                        />
                    </motion.div>
                    
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                        className="mt-6 space-y-1"
                    >
                        <h1 className="m-6 text-3xl font-bold text-[#4d8aff] drop-shadow-[0_0_15px_rgba(77,138,255,0.6)] animate-pulse">
                            {PROFILE_DATA.displayName}
                        </h1>
                        <p className="text-[#a78bfa] font-medium tracking-wider text-xl italic">
                            {PROFILE_DATA.quote}
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                        className="mt-2 w-full"
                    >
                        <SocialRow />
                    </motion.div>
                </div>

                {/* ABOUT ME */}
                <GlassCard className="w-full p-6 bg-black/40 border-white/10" delay={0.4}>
                <SectionTitle>關於我</SectionTitle>
                <div className="space-y-6 text-center">
                    <InfoRow label="姓名" value={PROFILE_DATA.about.name} />
                    <InfoRow label="暱稱" value={PROFILE_DATA.about.nicknames} />
                    <InfoRow label="年齡" value={PROFILE_DATA.about.age} />
                    <InfoRow label="座標" value={PROFILE_DATA.about.location} />
                    <InfoRow label="雷點" value={PROFILE_DATA.about.dislikes} />
                    <InfoRow label="可能會雷到你的點" value={PROFILE_DATA.about.habits} isList />
                </div>
                </GlassCard>

                {/* IMAGE BREAK 1 (Updated to 2 images) */}
                <motion.div 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    className="w-full flex gap-4 overflow-hidden h-48"
                >
                    <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/10">
                        <img src={SECTION_IMAGES[0]} alt="Kanade" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/10">
                        <img src={SECTION_IMAGES[1]} alt="Seele" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                </motion.div>

                {/* ACTIVITY SCOPE */}
                <GlassCard className="w-full p-6 bg-black/40 border-white/10">
                <SectionTitle>活動範圍</SectionTitle>
                <div className="space-y-6 text-center">
                    <InfoRow label="社交媒體" value={PROFILE_DATA.activity.socialPriority} />
                    <InfoRow label="時段" value={PROFILE_DATA.activity.hours} isList />
                    <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-gray-300">
                    {PROFILE_DATA.activity.note}
                    </div>
                </div>
                </GlassCard>

                {/* IMAGE BREAK 2 */}
                <motion.div 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    className="w-full flex gap-4 overflow-hidden"
                >
                    <div className="flex-1 h-40 rounded-2xl overflow-hidden border border-white/10">
                        <img src={SECTION_IMAGES[2]} alt="Decor" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 h-40 rounded-2xl overflow-hidden border border-white/10">
                        <img src={SECTION_IMAGES[3]} alt="Decor" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                </motion.div>

                {/* GAMES */}
                <GlassCard className="w-full p-6 bg-black/40 border-white/10">
                <SectionTitle>遊戲坑、推角</SectionTitle>
                <div className="space-y-8">
                    {PROFILE_DATA.games.map((group, idx) => (
                        <div key={idx} className="text-center">
                            <h3 className="text-cyan-300 font-medium mb-3 border-b border-white/10 pb-1 inline-block px-4">
                                {group.title}
                            </h3>
                            <motion.div 
                                variants={listContainerVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                className="flex flex-col gap-2 items-center"
                            >
                                {group.items.map((item, i) => (
                                    <motion.div key={i} variants={listItemVariants} className="text-gray-200 text-sm sm:text-base">
                                        {renderCategoryItem(item)}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    ))}
                </div>
                </GlassCard>

                {/* IMAGE BREAK 3 (Updated to Emilia and Kurumi images) */}
                <motion.div 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                    className="w-full flex gap-4 overflow-hidden h-48"
                >
                    <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/10">
                        <img src={SECTION_IMAGES[4]} alt="Emilia" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/10">
                        <img src={SECTION_IMAGES[5]} alt="Kurumi" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                    </div>
                </motion.div>

                {/* ANIME */}
                <GlassCard className="w-full p-6 bg-black/40 border-white/10">
                <SectionTitle>動漫坑、推角</SectionTitle>
                <div className="space-y-8">
                    {PROFILE_DATA.anime.map((group, idx) => (
                        <div key={idx} className="text-center">
                            <h3 className="text-cyan-300 font-medium mb-3 border-b border-white/10 pb-1 inline-block px-4">
                                {group.title}
                            </h3>
                            <motion.div 
                                variants={listContainerVariants}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true }}
                                className="flex flex-col gap-2 items-center"
                            >
                                {group.items.map((item, i) => (
                                    <motion.div key={i} variants={listItemVariants} className="text-gray-200 text-sm sm:text-base">
                                        {renderCategoryItem(item)}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    ))}
                </div>
                </GlassCard>

                {/* FOOTER */}
                <footer className="py-8 text-center text-gray-500 text-xs">
                <p>© {new Date().getFullYear()} {PROFILE_DATA.about.name}</p>
                <p className="mt-1 opacity-50">Designed with Glassmorphism</p>
                </footer>

            </div>
            </div>
        )}
    </>
  );
};

export default App;