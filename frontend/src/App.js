import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext.js';
import Main from './pages/main.jsx';
import Card from '../src/pages/card.jsx';
import Mycard from '../src/pages/myCard.jsx';
import SavedMyCard from '../src/pages/savedMyCard.jsx';


function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/card' element={<Card />} />
        <Route path='/mycard' element={<Mycard />} />
        <Route path='/savedmycard' element={<SavedMyCard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
