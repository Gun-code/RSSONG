import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/main';
import MyCard from './pages/myCard';
import Card from './pages/card';
import SavedMyCard from './pages/savedMyCard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/mycard" element={<MyCard />} />
        <Route path="/card" element={<Card />} />
        <Route path="/savedMyCard" element={<SavedMyCard/>} />
      </Routes>
    </Router>
  );
}

export default App; 