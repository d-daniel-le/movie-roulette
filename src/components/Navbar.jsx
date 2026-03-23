import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaBars, FaTimes } from 'react-icons/fa'; 
import { useContext, useState } from 'react';
import { AuthContext } from './AuthProvider';
import "./NavBar.css"

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for mobile menu and search input
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const goToProfile = () => {
    setIsMobileMenuOpen(false); // Close menu on navigation
    navigate("/profile");
  }

  const loginOnClick = () => {
    setIsMobileMenuOpen(false); // Close menu on navigation
    navigate("/login");
  }

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/results?q=${encodeURIComponent(searchQuery)}`)
    setSearchQuery("")
    console.log("Searching TMDB for:", searchQuery); 
    setIsMobileMenuOpen(false);
  }

  return (
    // Added an aria-label to the main navigation for screen readers
    <nav className="navbar" aria-label="Main Navigation">
      {/* LEFT SIDE: Logo and Desktop Links */}
      <div className="navbar-left">
        <div className="navbar-logo">
          <span className="logo-icon">CineSpin</span> 
        </div>
        
        <ul className="navbar-links desktop-only">
          <li><Link to="/" className="nav-link" onClick={() =>{setSearchQuery("")}}>Home</Link></li>
          <li><Link to="/trending" className="nav-link" onClick={() =>{setSearchQuery("")}}>Trending</Link></li>
          <li><Link to="/wheel" className="nav-link" onClick={() =>{setSearchQuery("")}}>Wheel</Link></li>
        </ul>
      </div>
      
      {/* RIGHT SIDE: Search, Profile, and Mobile Toggle */}
      <div className="navbar-actions">
        {/* Desktop Search */}
        <form className="search-container desktop-only" onSubmit={handleSearch} role="search">
          <input 
            type="text" 
            placeholder="Search movies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search for a movie"
          />
          <button type="submit" className="icon-btn search-btn" aria-label="Submit search"><FaSearch/></button>
        </form>

        {/* Desktop Profile/Login */}
        <div className="desktop-only">
          {user ? 
            <button className="icon-btn profile-btn" onClick={goToProfile} aria-label="Go to Profile"><FaUser /> {user.displayName || "Profile"}</button> : 
            <button className="icon-btn user-btn" onClick={loginOnClick} aria-label="Log In"><FaUser/> Login</button>
          }
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-dropdown"
          aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <div id="mobile-dropdown" className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <form className="mobile-search-container" onSubmit={handleSearch} role="search">
          <input 
            type="text" 
            placeholder="Search movies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search for a movie"
          />
          <button type="submit" className="icon-btn search-btn" aria-label="Submit search"><FaSearch/></button>
        </form>

        <ul className="mobile-navbar-links">
          <li><Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/trending" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Trending</Link></li>
          <li><Link to="/wheel" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Wheel</Link></li>
        </ul>

        <div className="mobile-profile-section">
          {user ? 
            <button className="icon-btn profile-btn" onClick={goToProfile} aria-label="Go to Profile"><FaUser /> {user.displayName || "Profile"}</button> : 
            <button className="icon-btn user-btn" onClick={loginOnClick} aria-label="Log In"><FaUser/> Login</button>
          }
        </div>
      </div>
    </nav>
  );
}