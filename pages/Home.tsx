
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { StyleChipsBar } from '../components/UI/StyleChipsBar';
import { ImageUploadArea } from '../components/Upload/ImageUploadArea';
import { SAMPLE_IMAGES, ROOM_TYPES } from '../constants';
import { imageService } from '../services/geminiService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDesign();
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_IMAGE', payload: url });
  };

  const handleSampleSelect = (url: string) => {
    dispatch({ type: 'SET_IMAGE', payload: url });
  };

  const handleGenerateAISample = async () => {
    setIsGeneratingSample(true);
    try {
      const imageUrl = await imageService.generateInitialRoom(state.params.roomType);
      if (imageUrl) {
        dispatch({ type: 'SET_IMAGE', payload: imageUrl });
      }
    } catch (error) {
      console.error("Erro ao gerar amostra IA", error);
      alert("Erro ao gerar imagem com IA. Verifique sua chave de API ou conexão.");
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleStart = () => {
    if (state.originalImage) {
      navigate('/studio');
    } else {
      alert("Por favor, envie ou selecione uma imagem primeiro.");
    }
  };

  const updateRoomType = (room: string) => {
    dispatch({ type: 'UPDATE_PARAMS', payload: { roomType: room } });
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B0F19] to-[#0B0F19]">
        
        <div className="max-w-4xl w-full space-y-8 text-center">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Consultoria de Interiores Generativa
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              Transforme seu espaço <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                com o poder do Gemini.
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Envie uma foto ou gere um ambiente do zero usando IA. Visualize mudanças instantâneas em qualquer estilo.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-1 border border-white/10 shadow-2xl shadow-indigo-500/10">
            <div className="bg-[#0B0F19]/80 rounded-[20px] p-6 md:p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">Ambiente Desejado</label>
                  <select 
                    value={state.params.roomType}
                    onChange={(e) => updateRoomType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">Estilo Preferido</label>
                  <select 
                    value={state.style}
                    onChange={(e) => dispatch({ type: 'SET_STYLE', payload: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Moderno">Moderno</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Escandinavo">Escandinavo</option>
                    <option value="Minimalista">Minimalista</option>
                  </select>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">Imagem de Referência</label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                    <ImageUploadArea 
                      onImageSelect={handleImageSelect} 
                      previewUrl={state.originalImage}
                    />
                  </div>
                  <div className="md:col-span-4 space-y-3">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Ponto de Partida</p>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {SAMPLE_IMAGES.map((sample) => (
                        <button 
                          key={sample.label}
                          onClick={() => handleSampleSelect(sample.url)}
                          className={`relative aspect-video rounded-lg overflow-hidden group border transition-all ${state.originalImage === sample.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-white/5 hover:border-white/20'}`}
                        >
                          <img 
                            src={sample.url} 
                            alt={sample.label} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{sample.label}</span>
                          </div>
                        </button>
                      ))}
                      
                      <button 
                        onClick={handleGenerateAISample}
                        disabled={isGeneratingSample}
                        className="relative aspect-video rounded-lg overflow-hidden group border border-dashed border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all flex flex-col items-center justify-center gap-1 min-h-[60px]"
                      >
                        {isGeneratingSample ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                            <span className="text-[8px] text-indigo-400 font-bold uppercase">Criando {state.params.roomType}...</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">✨</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase text-center px-2 leading-none">Gerar {state.params.roomType} com IA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={handleStart}
                  disabled={!state.originalImage || isGeneratingSample}
                  className={`
                    w-full px-8 py-5 rounded-xl font-bold text-white text-lg transition-all transform flex items-center justify-center gap-3
                    ${state.originalImage && !isGeneratingSample
                      ? 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  {state.originalImage ? 'Continuar para o Estúdio →' : 'Selecione ou gere uma imagem'}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
