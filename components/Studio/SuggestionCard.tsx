import React from 'react';
import { Suggestion } from '../../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion }) => {
  return (
    <div className="glass-panel p-5 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-white text-lg">{suggestion.title}</h4>
        <div className="flex gap-1">
          {suggestion.tags.map(tag => (
            <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-300 mb-4 leading-relaxed">
        {suggestion.description}
      </p>
      <div className="bg-black/20 rounded-lg p-3">
        <p className="text-xs text-slate-500 uppercase font-bold mb-2">Elementos Chave</p>
        <ul className="text-sm text-slate-200 space-y-1">
          {suggestion.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};