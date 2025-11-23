import React from 'react';
import { SOCIAL_LINKS } from '../constants';

const SocialRow: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-8">
      {SOCIAL_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              group relative
              text-cyan-400 transition-all duration-300 
              transform hover:scale-110 hover:-translate-y-1
              rounded-full border border-cyan-400/50 p-3
              hover:bg-cyan-400 hover:text-black
            `}
            aria-label={link.platform}
          >
            <div className="relative z-10">
              <Icon size={24} strokeWidth={2} />
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default SocialRow;