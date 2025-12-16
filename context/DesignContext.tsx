import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DesignState, DesignAction, ProjectParams } from '../types';
import { INTERIOR_STYLES } from '../constants';

const initialParams: ProjectParams = {
  roomType: 'Sala de Estar',
  area: 25,
  budget: 'Médio',
  colors: ['Neutro'],
  boldness: 'Equilibrado',
};

const initialState: DesignState = {
  style: INTERIOR_STYLES[0],
  originalImage: null,
  proposedImage: null,
  params: initialParams,
  suggestions: [],
  chatHistory: [
    {
      id: 'init',
      role: 'assistant',
      content:
        'Olá! Envie uma foto e escolha um estilo para começar. Estou aqui para ajudar você a visualizar o espaço dos seus sonhos.',
      timestamp: Date.now(),
    },
  ],
  isGenerating: false,
};

function designReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'SET_STYLE':
      return { ...state, style: action.payload };
    case 'SET_IMAGE':
      return { ...state, originalImage: action.payload, proposedImage: null }; // Reset proposed when new image uploaded
    case 'SET_PROPOSED_IMAGE':
      return { ...state, proposedImage: action.payload };
    case 'UPDATE_PARAMS':
      return { ...state, params: { ...state.params, ...action.payload } };
    case 'ADD_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'RESET_PROJECT':
      return initialState;
    default:
      return state;
  }
}

const DesignContext = createContext<{
  state: DesignState;
  dispatch: React.Dispatch<DesignAction>;
} | undefined>(undefined);

export const DesignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(designReducer, initialState);

  return <DesignContext.Provider value={{ state, dispatch }}>{children}</DesignContext.Provider>;
};

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};
