import React from 'react';
import { INTERIOR_STYLES } from '../../constants';

interface StyleChipsBarProps {
  selectedStyle: string;
  onSelect: (style: string) => void;
  className?: string;
}

export const StyleChipsBar: React.FC<StyleChipsBarProps> = ({ selectedStyle, onSelect, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto py-4 no-scrollbar ${className}`}>
      <div className="flex gap-3 px-4 min-w-max">
        {INTERIOR_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => onSelect(style)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
              ${selectedStyle === style
                ? 'bg-white text-brand-dark shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }
            `}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};
