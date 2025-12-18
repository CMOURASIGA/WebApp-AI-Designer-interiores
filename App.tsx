
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DesignProvider } from './context/DesignContext';

// Carregamento Preguiçoso (Lazy Loading) das páginas para reduzir o tamanho dos chunks
const Home = lazy(() => import('./pages/Home'));
const Studio = lazy(() => import('./pages/Studio'));
const Presentation = lazy(() => import('./pages/Presentation'));

// Componente de carregamento simples e elegante
const PageLoader = () => (
  <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    <p className="text-slate-400 text-sm font-medium animate-pulse uppercase tracking-widest">Carregando Estúdio...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <DesignProvider>
      <HashRouter>
        {/* Suspense envolve as rotas para lidar com o carregamento dos chunks dinâmicos */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/presentation" element={<Presentation />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </DesignProvider>
  );
};

export default App;
