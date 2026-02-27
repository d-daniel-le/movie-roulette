import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">CineSpin</span> 
      </div>
      
      <ul className="navbar-links">
        <li><Link to="/" className="nav-link">Home</Link></li>
        <li><Link to="/movies" className="nav-link">Movies</Link></li>
        <li><Link to="/trending" className="nav-link">Trending</Link></li>
        <li><Link to="/wheel" className="nav-link">Wheel</Link></li>
      </ul>

      <div className="navbar-actions">
        <button className="icon-btn search-btn">Search</button>
        <button className="icon-btn user-btn">Profile</button>
      </div>
    </nav>
  );
}