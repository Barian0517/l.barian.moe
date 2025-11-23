import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { PROFILE_DATA } from '../constants';

// NOTE: This component is legacy and currently not used in the main App (App.tsx),
// but kept for compatibility. It uses the first track of the playlist.

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Use first track as default
  const music = PROFILE_DATA.music[0];

  // Simulate progress when playing
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <GlassCard className="p-6 w-full max-w-md mx-auto mt-8 bg-black/40 border-white/10">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <div className="text-cyan-300 font-medium text-lg animate-pulse">
            {isPlaying ? '正在播放:' : '暫停播放:'}
          </div>
          <div className="text-white text-xl font-bold mt-1">
            {music.title} - {music.artist}
          </div>
        </div>

        <div className="w-full flex items-center gap-4 mt-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-cyan-300 transition-all transform hover:scale-110 active:scale-95"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-mono">
              <span>0:{progress < 10 ? `0${progress}` : progress}</span>
              <span>3:45</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full max-w-[200px] mt-2">
            <Volume2 size={16} className="text-gray-400" />
            <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="80"
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
            />
        </div>
      </div>
    </GlassCard>
  );
};

export default MusicPlayer;