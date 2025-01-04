import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Main from './pages/main.jsx';
import Card from '../src/pages/card.jsx';
import Mycard from '../src/pages/myCard.jsx';
import SavedMyCard from '../src/pages/savedMyCard.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path='/' element={<Main />} />
      <Route path='/card' element={<Card />} />
      <Route path='/mycard' element={<Mycard />} />
      <Route path='/mysavedcard' element={<SavedMyCard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
