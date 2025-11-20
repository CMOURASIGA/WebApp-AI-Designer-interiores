import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { StyleChipsBar } from '../components/UI/StyleChipsBar';
import { ImageUploadArea } from '../components/Upload/ImageUploadArea';
import { SAMPLE_IMAGES } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDesign();

  const handleImageSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_IMAGE', payload: url });
  };

  const handleSampleSelect = (url: string) => {
    dispatch({ type: 'SET_IMAGE', payload: url });
  };

  const handleStart = () => {
    if (state.originalImage) {
      navigate('/studio');
    } else {
      alert("Por favor, envie ou selecione uma imagem primeiro.");
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0B0F19] to-[#0B0F19]">
        
        <div className="max-w-3xl w-full space-y-8 text-center">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Design com IA
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              Visualize seu espaço em <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                qualquer estilo instantaneamente.
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Envie uma foto, escolha um estilo e deixe nossa consultora IA criar o projeto de interiores perfeito para você.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-1 border border-white/10 shadow-2xl shadow-indigo-500/10">
            <div className="bg-[#0B0F19]/80 rounded-[20px] p-6 md:p-8 space-y-8">
              
              {/* Style Selector */}
              <div className="text-left">
                <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">1. Escolha um Estilo</label>
                <StyleChipsBar 
                  selectedStyle={state.style} 
                  onSelect={(style) => dispatch({ type: 'SET_STYLE', payload: style })} 
                  className="-mx-6 px-6 md:mx-0 md:px-0"
                />
              </div>

              {/* Upload Area */}
              <div className="text-left">
                <label className="block text-sm font-medium text-slate-400 mb-3 ml-1">2. Envie uma Foto do Ambiente</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <ImageUploadArea 
                      onImageSelect={handleImageSelect} 
                      previewUrl={state.originalImage}
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-medium uppercase">Ou tente um exemplo</p>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {SAMPLE_IMAGES.map((sample) => (
                        <button 
                          key={sample.label}
                          onClick={() => handleSampleSelect(sample.url)}
                          className="relative aspect-video rounded-lg overflow-hidden group border border-white/5 hover:border-indigo-500/50 transition-all"
                        >
                          <img src={sample.url} alt={sample.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white shadow-black drop-shadow-md">{sample.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <button
                  onClick={handleStart}
                  disabled={!state.originalImage}
                  className={`
                    w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white text-lg transition-all transform
                    ${state.originalImage 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-1' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  Entrar no Estúdio →
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