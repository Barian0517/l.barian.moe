import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2, ListMusic, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROFILE_DATA, MUSIC_PLAYLIST_URL } from '../constants';
import { MusicTrack } from '../types';

const FloatingMusicPlayer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  // Default to playing on load
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [playlist, setPlaylist] = useState<MusicTrack[]>(PROFILE_DATA.music);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch Playlist from URL
  useEffect(() => {
    const fetchPlaylist = async () => {
        if (!MUSIC_PLAYLIST_URL) return;
        try {
            // Add cache: no-store to prevent caching issues
            const response = await fetch(MUSIC_PLAYLIST_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error("Network response was not ok");
            
            const text = await response.text();
            // Split by newline (handle both \n and \r\n)
            const lines = text.split(/\r?\n/);
            const urls = lines.filter(line => line.trim() !== '' && line.trim().startsWith('http'));
            
            if (urls.length > 0) {
                const newTracks: MusicTrack[] = urls.map(url => {
                    const cleanUrl = url.trim();
                    // Extract filename from URL
                    const fileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
                    // Decode URI components (e.g. %20 to space)
                    const decodedName = decodeURIComponent(fileName);
                    // Remove extension
                    const title = decodedName.replace(/\.[^/.]+$/, "");
                    
                    // Try to guess artist if format is "Artist - Title" or similar, otherwise default
                    let artist = "Unknown";
                    let trackTitle = title;
                    
                    if (title.includes('-')) {
                        const parts = title.split('-');
                        if (parts.length >= 2) {
                            // Simple heuristic, could be improved
                        }
                    }

                    return {
                        title: trackTitle,
                        artist: "Playlist Track", 
                        url: cleanUrl
                    };
                });
                setPlaylist(newTracks);
                setCurrentTrackIndex(0);
            }
        } catch (error) {
            console.error("Failed to fetch playlist, using default:", error);
        }
    };
    fetchPlaylist();
  }, []);

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  // Handle Autoplay logic on mount
  useEffect(() => {
    if (audioRef.current) {
        // Attempt to play immediately on mount
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay prevented:", error);
                setIsPlaying(false); // Update UI to show paused state if blocked
            });
        }
    }
  }, []);

  // Handle Volume Changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle Track Change
  useEffect(() => {
    if (isPlaying && audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => console.warn("Play interrupted", e));
        }
    }
  }, [currentTrackIndex, currentTrack]); 

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(e => {
          console.warn("Play prevented", e);
          setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekValue = parseFloat(e.target.value);
    if (audioRef.current) {
      const seekTime = (seekValue / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(seekValue);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Interaction Handlers
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    setTimeout(() => setShowPlaylist(false), 300);
  };

  // Button Handlers
  const handleTogglePlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    setShowPlaylist(false);
  };

  // Particle Animation Helpers
  const particles = Array.from({ length: 12 });

  return (
    <>
      <audio 
        ref={audioRef} 
        src={currentTrack?.url}
        crossOrigin="anonymous"  
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
        autoPlay // Helps with mobile restrictions sometimes
      />

      <div 
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed bottom-6 left-6 z-50 flex items-end justify-start"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* COLLAPSED STATE: Floating Disc + Particles + Marquee */
            <motion.div
              key="collapsed"
              className="flex items-center gap-3 cursor-pointer"
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* The Disc */}
              <motion.div
                 variants={{
                   initial: { scale: 0, opacity: 0 },
                   animate: { scale: 1, opacity: 1, transition: { type: "spring", duration: 0.5 } },
                   exit: { scale: 0, opacity: 0, filter: "blur(10px)", transition: { duration: 0.3 } }
                 }}
                 className="relative w-16 h-16 flex-shrink-0 rounded-full border-2 border-white/20 bg-black/80 shadow-[0_0_20px_rgba(77,138,255,0.3)] flex items-center justify-center overflow-hidden group"
              >
                {/* Spinning Texture */}
                <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 ${isPlaying ? 'animate-spin-slow' : ''}`}></div>
                <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
                   <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-800 to-black border border-white/10 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-cyan-500/50 blur-[2px]"></div>
                   </div>
                </div>

                {/* Implosion Particles (Only visible on Entrance) */}
                {particles.map((_, i) => (
                    <motion.div
                        key={`in-${i}`}
                        className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                        variants={{
                        initial: { 
                            x: (Math.random() - 0.5) * 100, 
                            y: (Math.random() - 0.5) * 100, 
                            opacity: 0 
                        },
                        animate: { 
                            x: 0, 
                            y: 0, 
                            opacity: 0,
                            transition: { duration: 0.5, ease: "easeOut" } 
                        }
                        }}
                    />
                ))}
              </motion.div>

              {/* Marquee Info (Visible only when playing) */}
              {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, width: 0, transition: { duration: 0.2 } }}
                    className="h-8 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center overflow-hidden max-w-[180px]"
                  >
                      <div className="w-full overflow-hidden flex items-center h-full mask-gradient">
                          <motion.div 
                             className="flex gap-8 text-[10px] font-mono text-cyan-100/70 whitespace-nowrap"
                             animate={{ x: "-50%" }}
                             transition={{ 
                               ease: "linear", 
                               duration: 10, 
                               repeat: Infinity 
                             }}
                          >
                              {/* Duplicated content for seamless loop */}
                              <div className="flex items-center gap-2">
                                <span>{currentTrack?.title}</span>
                                <span className="opacity-50">-</span>
                                <span>{currentTrack?.artist}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{currentTrack?.title}</span>
                                <span className="opacity-50">-</span>
                                <span>{currentTrack?.artist}</span>
                              </div>
                          </motion.div>
                      </div>
                  </motion.div>
              )}
            </motion.div>
          ) : (
            /* EXPANDED STATE: Player UI */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)", y: 20 }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(20px)", transition: { duration: 0.3 } }}
              transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.4 }}
              // Fixed height (280px) to match compact player size. Playlist will scroll within this.
              className="w-80 h-[250px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col"
            >
              {/* Background Ambient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 via-transparent to-purple-900/20 pointer-events-none" />
              
              <div className="relative z-10 p-5 flex flex-col h-full">
                  {/* Header Navigation */}
                  <div className="flex-none flex justify-between items-center mb-2">
                      <span className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase opacity-80 animate-pulse">
                          {showPlaylist ? "PLAYLIST" : "NOW PLAYING"}
                      </span>
                      <div className="flex gap-2 items-center">
                          {/* Navigation Button: Playlist <-> Back */}
                          <button 
                              onClick={handleTogglePlaylist} 
                              className={`p-1.5 rounded-full transition-all duration-300 ${showPlaylist ? 'bg-white/10 text-white hover:bg-white/20' : 'hover:bg-white/10 text-gray-400 hover:text-cyan-400'}`}
                              title={showPlaylist ? "Back to Player" : "Playlist"}
                          >
                              {showPlaylist ? <ArrowLeft size={16} /> : <ListMusic size={16} />}
                          </button>
                          
                          {/* Close Button: Minimizes Player */}
                          <button 
                              onClick={handleClose} 
                              className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-gray-400"
                              title="Close"
                          >
                              <X size={16} />
                          </button>
                      </div>
                  </div>

                  {/* Views */}
                  <AnimatePresence mode="wait">
                    {!showPlaylist ? (
                        /* Player View */
                        <motion.div 
                            key="player"
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col justify-between pb-1"
                        >
                            <div className="flex gap-5 items-center mt-1">
                                {/* Album Art */}
                                <div className={`relative w-24 h-24 flex-shrink-0 rounded-full border-[3px] border-white/10 shadow-2xl overflow-hidden bg-black group ${isPlaying ? 'animate-spin-slow' : ''}`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-900 to-black border border-white/20 shadow-inner"></div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 overflow-hidden flex flex-col justify-center h-full">
                                    <div className="relative overflow-hidden w-full">
                                        <h3 className="text-white font-bold text-lg truncate leading-tight drop-shadow-md">
                                            {currentTrack?.title || "Loading..."}
                                        </h3>
                                    </div>
                                    <p className="text-cyan-400/80 text-xs font-medium tracking-wide truncate mt-1">
                                        {currentTrack?.artist || "Unknown Artist"}
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="group mt-2">
                                <div className="relative h-1.5 bg-white/10 rounded-full w-full cursor-pointer overflow-hidden">
                                    <motion.div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                        style={{ width: `${progress}%` }}
                                        layoutId="progress"
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progress || 0}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-mono group-hover:text-gray-400 transition-colors">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between px-1 mt-1">
                                {/* Volume */}
                                <div className="group/vol relative flex items-center w-8 hover:w-24 transition-all duration-300 ease-out overflow-hidden">
                                    <Volume2 size={18} className="text-gray-400 flex-shrink-0 relative z-10" />
                                    <div className="ml-2 w-16 h-1 bg-white/10 rounded-full relative">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full" 
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="1" 
                                            step="0.01"
                                            value={volume} 
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Main Buttons */}
                                <div className="flex items-center gap-5">
                                    <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95">
                                        <SkipBack size={22} fill="currentColor" className="opacity-50 hover:opacity-100" />
                                    </button>
                                    <button 
                                        onClick={togglePlay}
                                        className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] border border-white/20"
                                    >
                                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                    </button>
                                    <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95">
                                        <SkipForward size={22} fill="currentColor" className="opacity-50 hover:opacity-100" />
                                    </button>
                                </div>
                                
                                {/* Spacer */}
                                <div className="w-8"></div> 
                            </div>
                        </motion.div>
                    ) : (
                        /* Playlist View */
                        <motion.div 
                            key="playlist"
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2"
                        >
                            {playlist.map((track, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => selectTrack(idx)}
                                    className={`
                                        flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 group flex-shrink-0
                                        ${currentTrackIndex === idx ? 'bg-white/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,0,0,0.2)]' : 'hover:bg-white/5 border border-transparent'}
                                    `}
                                >
                                    <div className={`text-xs font-mono w-4 text-center ${currentTrackIndex === idx ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                        {currentTrackIndex === idx && isPlaying ? (
                                            <span className="animate-pulse">▶</span>
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate transition-colors ${currentTrackIndex === idx ? 'text-cyan-300' : 'text-gray-200 group-hover:text-white'}`}>
                                            {track.title}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate">{track.artist}</div>
                                    </div>
                                    {currentTrackIndex === idx && (
                                        <div className="flex gap-0.5 items-end h-3 pb-0.5">
                                            <div className="w-0.5 h-full bg-cyan-400 animate-[bounce_1s_infinite]" />
                                            <div className="w-0.5 h-2/3 bg-cyan-400 animate-[bounce_1.2s_infinite]" />
                                            <div className="w-0.5 h-full bg-cyan-400 animate-[bounce_0.8s_infinite]" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {playlist.length === 0 && (
                                <div className="text-center text-gray-500 text-sm py-4">Loading playlist...</div>
                            )}
                        </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FloatingMusicPlayer;