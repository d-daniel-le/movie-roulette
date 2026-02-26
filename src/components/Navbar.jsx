export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        {/* Placeholder for the CineSpin icon */}
        <span className="logo-icon">CineSpin</span> 
      </div>
      
      <ul className="navbar-links">
        <li><a href="/" className="nav-link active">Home</a></li>
        <li><a href="/movies" className="nav-link">Movies</a></li>
        <li><a href="/trending" className="nav-link">Trending</a></li>
        <li><a href="/wheel" className="nav-link">Wheel</a></li>
      </ul>

      <div className="navbar-actions">
        {/* Placeholders for search and user profile icons */}
        <button className="icon-btn search-btn">Search</button>
        <button className="icon-btn user-btn">Profile</button>
      </div>
    </nav>
  );
}