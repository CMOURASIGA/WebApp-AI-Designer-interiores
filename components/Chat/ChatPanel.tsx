
import React, { useState, useRef, useEffect } from 'react';
import { useDesign } from '../../context/DesignContext';
import { chatService } from '../../services/geminiService';

export const ChatPanel: React.FC = () => {
  const { state, dispatch } = useDesign();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatHistory, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue,
      timestamp: Date.now()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(
        state.chatHistory, 
        userMsg.content, 
        { style: state.style, params: state.params }
      );
      dispatch({ type: 'ADD_MESSAGE', payload: response });
    } catch (error) {
      console.error("Chat Gemini Error", error);
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: "Erro técnico ao processar. Tente novamente em alguns segundos.",
          timestamp: Date.now()
        }
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Função simples para converter Markdown básico (headers e listas) em HTML se necessário
  // ou apenas aplicar estilos via classes no CSS global (escolhido por simplicidade e performance)
  const formatContent = (content: string) => {
    // Tratamos quebras de linha para virarem parágrafos no CSS
    return content.split('\n').map((line, i) => {
      if (line.startsWith('###')) {
        return <h3 key={i}>{line.replace('###', '').trim()}</h3>;
      }
      if (line.startsWith('*')) {
        return <li key={i}>{line.replace('*', '').trim()}</li>;
      }
      // Negritos básicos via regex simples para visualização rápida
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i}>
          {parts.map((part, j) => 
            part.startsWith('**') && part.endsWith('**') 
              ? <strong key={j}>{part.slice(2, -2)}</strong> 
              : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-inner">
      <div className="p-4 border-b border-white/5 bg-slate-900/80 backdrop-blur flex justify-between items-center">
        <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Consultoria Técnica</h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Protocolo {state.style}
            </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {state.chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-4 rounded-xl text-sm leading-relaxed shadow-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none border border-indigo-500'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none chat-content'
              }`}
            >
              {msg.role === 'assistant' ? formatContent(msg.content) : msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-xl rounded-bl-none border border-slate-700 flex gap-2 items-center">
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gerando Ficha</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-900 border-t border-white/5">
        <div className="relative flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Qual a iluminação recomendada?"
            className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm border border-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none resize-none h-10 max-h-32 transition-all"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition-all flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
