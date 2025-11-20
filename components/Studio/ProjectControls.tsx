import React from 'react';
import { useDesign } from '../../context/DesignContext';
import { ROOM_TYPES, BUDGET_OPTIONS, COLOR_PALETTES, BOLDNESS_OPTIONS } from '../../constants';

export const ProjectControls: React.FC = () => {
  const { state, dispatch } = useDesign();

  const handleParamChange = (key: string, value: any) => {
    dispatch({ type: 'UPDATE_PARAMS', payload: { [key]: value } });
  };

  return (
    <div className="space-y-6 p-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ambiente</label>
          <select
            value={state.params.roomType}
            onChange={(e) => handleParamChange('roomType', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Área (m²)</label>
          <input
            type="number"
            value={state.params.area}
            onChange={(e) => handleParamChange('area', Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Orçamento</label>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          {BUDGET_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => handleParamChange('budget', opt)}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                state.params.budget === opt ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nível de Ousadia</label>
         <input 
           type="range" 
           min="0" 
           max="2" 
           step="1"
           value={BOLDNESS_OPTIONS.indexOf(state.params.boldness)}
           onChange={(e) => handleParamChange('boldness', BOLDNESS_OPTIONS[parseInt(e.target.value)])}
           className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
         />
         <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Discreto</span>
            <span>Equilibrado</span>
            <span>Ousado</span>
         </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paleta de Cores</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTES.map(color => (
            <button
              key={color}
              onClick={() => {
                const exists = state.params.colors.includes(color);
                const newColors = exists 
                  ? state.params.colors.filter(c => c !== color)
                  : [...state.params.colors, color];
                handleParamChange('colors', newColors);
              }}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                state.params.colors.includes(color)
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};