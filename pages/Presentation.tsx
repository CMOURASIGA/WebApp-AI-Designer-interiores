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
          <p className="text-slate-400 mb-4">Nenhum design gerado ainda.</p>
          <Link to="/studio" className="text-indigo-400 hover:text-indigo-300 underline">Voltar ao Estúdio</Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-xs font-bold text-indigo-400 tracking-widest uppercase">Conceito de Design</h2>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">{state.params.roomType} {state.style}</h1>
          <p className="text-slate-400">Preparado para o Cliente • {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Hero Image */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
          <img src={state.proposedImage} alt="Design Final" className="w-full h-auto" />
        </div>

        {/* Concept Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-display font-semibold text-white mb-4">O Conceito</h3>
            <p className="text-slate-300 leading-relaxed text-lg">
              Este design abraça os princípios fundamentais do estilo <strong>{state.style}</strong>, utilizando uma paleta de tons {state.params.colors.join(' e ').toLowerCase()} para criar um espaço que parece curado e convidativo. 
              Dada a área de {state.params.area}m², maximizamos o fluxo espacial selecionando móveis com peso visual {state.params.boldness.toLowerCase()}.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-display font-semibold text-white mb-4">Por que funciona</h3>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</span>
                <p className="text-slate-300">Equilibra a estética com a restrição de orçamento {state.params.budget.toLowerCase()}.</p>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</span>
                <p className="text-slate-300">Otimiza a luz natural para o layout específico de {state.params.roomType}.</p>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">3</span>
                <p className="text-slate-300">Incorpora elementos {state.params.boldness.toLowerCase()} para criar um ponto focal único.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Item List Grid */}
        <div>
           <h3 className="text-2xl font-display font-semibold text-white mb-8 text-center border-t border-white/10 pt-8">Seleção Curada</h3>
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
            ← Voltar ao Editor
          </Link>
        </div>

      </div>
    </AppLayout>
  );
};

export default Presentation;