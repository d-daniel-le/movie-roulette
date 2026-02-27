import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Trending from './pages/Trending';
import Wheel from './pages/Wheel';
import './App.css'; 

function App() {
  return (
    <div className="app-container">
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/wheel" element={<Wheel />} />
      </Routes>
    </div>
  );
}

export default App;