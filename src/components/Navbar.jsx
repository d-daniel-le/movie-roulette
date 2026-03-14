import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import "./NavBar.css"

export default function Navbar() {

  const { user } = useContext(AuthContext)

  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/profile")
  }

  const loginOnClick = () =>{
    navigate("/login")
  }

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
        <button className="icon-btn search-btn"><FaSearch/></button>
        {
          user?
          <button className="icon-btn profile-btn" onClick={goToProfile}><FaUser />{user.displayName || "Profile"}</button>  : 
          <button className="icon-btn user-btn" onClick={loginOnClick}><FaUser/></button>
        }
      </div>
    </nav>
  );
}