import { Link } from 'react-router-dom';
import { FaSearch, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const [user, setUser] = useState(null)
  useEffect(() =>{
    const stopListening = onAuthStateChanged(auth, (user) => {
      setUser(user)
    })

    return () => stopListening();
  }, [])

  const navigate = useNavigate();

  const loginOnClick = (event) =>{
    event.preventDefault();

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
          <button className="icon-btn profile-btn"><FaUser />{user.uid}</button>  : 
          <button className="icon-btn user-btn" onClick={loginOnClick}><FaUser/></button>
        }
      </div>
    </nav>
  );
}