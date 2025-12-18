
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { StyleChipsBar } from '../components/UI/StyleChipsBar';
import { ProjectControls } from '../components/Studio/ProjectControls';
import { SuggestionCard } from '../components/Studio/SuggestionCard';
import { BeforeAfterSlider } from '../components/Studio/BeforeAfterSlider';
import { ChatPanel } from '../components/Chat/ChatPanel';
import { designService, imageService } from '../services/geminiService';

const Studio: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDesign();

  useEffect(() => {
    if (!state.originalImage) navigate('/');
  }, [state.originalImage, navigate]);

  const handleGenerate = async () => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    
    try {
      // Execução sequencial ou paralela das chamadas de IA
      const [suggestions, newImage] = await Promise.all([
        designService.generateSuggestions(state.style, state.params),
        imageService.generateProposedImage(state.originalImage!, state.style, state.params)
      ]);

      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
      dispatch({ type: 'SET_PROPOSED_IMAGE', payload: newImage });
      
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Analisei sua foto e apliquei o conceito ${state.style}. Reorganizei o espaço focando em ${state.params.colors.join(' e ')} para respeitar sua preferência. O que achou do novo visual?`,
          timestamp: Date.now()
        }
      });
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro ao processar com a IA. Verifique sua conexão ou tente novamente.");
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
        <div className="bg-[#0B0F19] border-b border-white/5 shadow-md z-10">
          <StyleChipsBar 
             selectedStyle={state.style} 
             onSelect={(style) => dispatch({ type: 'SET_STYLE', payload: style })} 
          />
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 lg:w-3/5 flex flex-col overflow-y-auto custom-scrollbar p-4 lg:p-6 gap-6">
            <div className="w-full">
              {state.proposedImage && state.originalImage ? (
                <BeforeAfterSlider 
                  beforeImage={state.originalImage} 
                  afterImage={state.proposedImage} 
                />
              ) : (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5">
                   <img 
                    src={state.originalImage || ''} 
                    className="w-full h-full object-cover opacity-60" 
                    alt="Original"
                   />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                     <button
                        onClick={handleGenerate}
                        disabled={state.isGenerating}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-70"
                     >
                       {state.isGenerating ? (
                         <>
                           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           A IA está criando...
                         </>
                       ) : (
                         <>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                           Gerar Proposta IA
                         </>
                       )}
                     </button>
                   </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 lg:col-span-4 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Parâmetros do Projeto
                  </h3>
                  <ProjectControls />
                  {state.proposedImage && (
                     <button
                        onClick={handleGenerate}
                        disabled={state.isGenerating}
                        className="w-full mt-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                     >
                        {state.isGenerating ? 'Refazendo...' : 'Refazer com novos ajustes'}
                     </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-7 lg:col-span-8">
                 <div className="space-y-4">
                    <h3 className="text-white font-semibold pl-1">Sugestões Estruturadas</h3>
                    {state.suggestions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {state.suggestions.map(s => <SuggestionCard key={s.id} suggestion={s} />)}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                        <p className="text-slate-500 italic">As sugestões aparecerão após a geração da proposta.</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-none lg:w-2/5 h-96 lg:h-auto border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0B0F19] p-4">
             <ChatPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Studio;
