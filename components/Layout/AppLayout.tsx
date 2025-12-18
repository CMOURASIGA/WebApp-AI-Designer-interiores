
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-200 font-sans selection:bg-indigo-500/30">
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-white">
                AI <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Consultor de Interiores</span>
              </h1>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
             {location.pathname === '/studio' && (
               <Link to="/presentation" className="hidden sm:inline-flex text-sm font-medium text-slate-400 hover:text-white transition-colors">
                 Ver Apresentação
               </Link>
             )}
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
               VC
             </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1920px] mx-auto">
        {children}
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 AI Consultor de Interiores. Protótipo Mock.</p>
        </div>
      </footer>
    </div>
  );
};
