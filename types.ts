export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  items: string[];
  tags: string[];
}

export interface ProjectParams {
  roomType: string;
  area: number;
  budget: 'Low' | 'Medium' | 'High';
  colors: string[];
  boldness: 'Discreet' | 'Balanced' | 'Bold';
}

export interface DesignState {
  style: string;
  originalImage: string | null;
  proposedImage: string | null;
  params: ProjectParams;
  suggestions: Suggestion[];
  chatHistory: Message[];
  isGenerating: boolean;
}

export type DesignAction =
  | { type: 'SET_STYLE'; payload: string }
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'SET_PROPOSED_IMAGE'; payload: string }
  | { type: 'UPDATE_PARAMS'; payload: Partial<ProjectParams> }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_SUGGESTIONS'; payload: Suggestion[] }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'RESET_PROJECT' };
