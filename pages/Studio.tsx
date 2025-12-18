
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { StyleChipsBar } from '../components/UI/StyleChipsBar';
import { ProjectControls } from '../components/Studio/ProjectControls';
import { SuggestionCard } from '../components/Studio/SuggestionCard';
import { BeforeAfterSlider } from '../components/Studio/BeforeAfterSlider';
import { ChatPanel } from '../components/Chat/ChatPanel';
import { designService, imageService, chatService } from '../services/geminiService';

const Studio: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDesign();
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.originalImage) navigate('/');
  }, [state.originalImage, navigate]);

  const handleGenerate = async () => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    setImageError(null);
    
    try {
      const suggestions = await designService.generateSuggestions(state.style, state.params);
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });

      const newImage = await imageService.generateProposedImage(state.originalImage!, state.style, state.params);
      
      if (newImage === "IMAGE_QUOTA_EXHAUSTED") {
        setImageError("Limite de imagens atingido.");
        
        // Novo prompt de fallback focado em Ficha Técnica
        const fallbackPrompt = `LIMITE DE IMAGEM ATINGIDO. Gere agora uma FICHA TÉCNICA DETALHADA para o estilo ${state.style}. FOCO: Materiais das superfícies, tipos de tecidos, layout técnico do mobiliário e temperatura de cor da iluminação. Seja sucinto e organizado em tópicos.`;
        
        const textFallback = await chatService.sendMessage(state.chatHistory, fallbackPrompt, { 
          style: state.style, 
          params: state.params 
        });
        
        dispatch({ type: 'ADD_MESSAGE', payload: textFallback });
      } else {
        dispatch({ type: 'SET_PROPOSED_IMAGE', payload: newImage });
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: {
            id: Date.now().toString(),
            role: 'assistant',
            content: `### PROPOSTA VISUAL CONCLUÍDA
            Conceito **${state.style}** aplicado com sucesso. Visualize o comparativo e as sugestões estruturadas abaixo.`,
            timestamp: Date.now()
          }
        });
      }
    } catch (e) {
      console.error(e);
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
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900/50">
                   {imageError ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/95 backdrop-blur-md">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                           <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-wider">Cota de Visualização Excedida</h3>
                        <p className="text-slate-400 max-w-sm mb-6 text-xs leading-relaxed">
                          A API atingiu o limite de geração visual gratuita. <br/>
                          <span className="text-indigo-400 font-bold">Consulte a Ficha Técnica gerada no Chat lateral.</span>
                        </p>
                        <button onClick={handleGenerate} className="px-5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg border border-indigo-500/30 text-[10px] font-bold uppercase tracking-widest transition-all">Tentar Gerar Imagem</button>
                     </div>
                   ) : (
                     <img 
                      src={state.originalImage || ''} 
                      className="w-full h-full object-cover opacity-30 grayscale" 
                      alt="Original"
                     />
                   )}
                   
                   {!imageError && (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <button
                          onClick={handleGenerate}
                          disabled={state.isGenerating}
                          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-2xl shadow-indigo-500/40 transition-all flex items-center gap-3 disabled:opacity-70 transform hover:scale-105 active:scale-95"
                       >
                         {state.isGenerating ? (
                           <>
                             <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                             Processando Dados...
                           </>
                         ) : (
                           <>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                             Gerar Especificação Técnica
                           </>
                         )}
                       </button>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
              <div className="md:col-span-5 lg:col-span-4 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/5">
                  <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Parâmetros do Projeto
                  </h3>
                  <ProjectControls />
                </div>
              </div>

              <div className="md:col-span-7 lg:col-span-8">
                 <div className="space-y-4">
                    <h3 className="text-white font-semibold text-xs uppercase tracking-widest pl-1 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Sugestões do Especialista
                    </h3>
                    {state.suggestions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {state.suggestions.map(s => <SuggestionCard key={s.id} suggestion={s} />)}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-700 rounded-2xl p-10 text-center bg-white/2">
                        <p className="text-slate-400 font-medium text-sm">Aguardando geração de dados...</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-none lg:w-2/5 h-[450px] lg:h-auto border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0B0F19] p-4 flex flex-col shadow-2xl">
             <ChatPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Studio;
