import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Trending from './pages/Trending';
import Wheel from './pages/Wheel';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
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
        <Route path="/login" element={<Login />}/>
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile />}/>
        <Route path='/results'element={<SearchResults />}></Route>
      </Routes>
    </div>
  );
}

export default App;