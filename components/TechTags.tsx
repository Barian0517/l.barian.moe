import React from 'react';

interface TechTagsProps {
  tags?: string[];
}

const TechTags: React.FC<TechTagsProps> = ({ tags = [] }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag) => (
        <div 
          key={tag}
          className="
            flex items-center gap-1.5 
            px-3 py-1.5 
            rounded-full 
            bg-white/5 border border-white/10 
            text-xs font-medium text-gray-300
            hover:bg-white/10 hover:text-white transition-colors cursor-default
          "
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

export default TechTags;