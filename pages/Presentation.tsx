import React from 'react';
import { Link } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import { AppLayout } from '../components/Layout/AppLayout';

const Presentation: React.FC = () => {
  const { state } = useDesign();

  if (!state.proposedImage) {
    return (
      <AppLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center text-center">
          <p className="text-slate-400 mb-4">No design generated yet.</p>
          <Link to="/studio" className="text-indigo-400 hover:text-indigo-300 underline">Return to Studio</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Design Concept</h2>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">{state.style} {state.params.roomType}</h1>
          <p className="text-slate-400">Prepared for Client • {new Date().toLocaleDateString()}</p>
        </div>

        {/* Hero Image */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <img src={state.proposedImage} alt="Final Design" className="w-full h-auto" />
        </div>

        {/* Concept Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-display font-semibold text-white mb-4">The Concept</h3>
            <p className="text-slate-300 leading-relaxed text-lg">
              This design embraces the core principles of <strong>{state.style}</strong>, utilizing a {state.params.colors.join(' and ')} palette to create a space that feels both curated and inviting. 
              Given the area of {state.params.area}m², we maximized spatial flow by selecting furniture with {state.params.boldness.toLowerCase()} visual weight.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-white mb-4">Why it works</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</span>
                <p className="text-slate-300">Balances aesthetics with the {state.params.budget} budget constraint.</p>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</span>
                <p className="text-slate-300">Optimizes natural light for the specific {state.params.roomType} layout.</p>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">3</span>
                <p className="text-slate-300">Incorporates {state.params.boldness} elements to create a unique focal point.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Item List Grid */}
        <div>
           <h3 className="text-2xl font-display font-semibold text-white mb-8 text-center border-t border-white/10 pt-8">Curated Selection</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {state.suggestions.flatMap(s => s.items).slice(0, 6).map((item, i) => (
               <div key={i} className="bg-slate-800/50 p-6 rounded-xl border border-white/5 flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                   <span className="text-2xl text-slate-400">🏷️</span>
                 </div>
                 <span className="text-slate-200 font-medium">{item}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="flex justify-center pt-10 pb-20">
          <Link to="/studio" className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors">
            ← Back to Studio Editor
          </Link>
        </div>

      </div>
    </AppLayout>
  );
};

export default Presentation;
