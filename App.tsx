import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DesignProvider } from './context/DesignContext';
import Home from './pages/Home';
import Studio from './pages/Studio';
import Presentation from './pages/Presentation';

const App: React.FC = () => {
  return (
    <DesignProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/presentation" element={<Presentation />} />
        </Routes>
      </HashRouter>
    </DesignProvider>
  );
};

export default App;
