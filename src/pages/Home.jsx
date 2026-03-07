import { useState, useEffect } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [COSLoading, setCOSLoading] = useState(true);
  const [COSmovies, setCOSMovies] = useState([]);

  useEffect(() => {
  const fetchMovies = async () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}`
      }
    };

    const today = new Date().toISOString().split('T')[0];
    const [popularRes, upcomingRes] = await Promise.all([
  fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options),
  fetch(`https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${today}&sort_by=popularity.desc&language=en-US&page=1`, options)
]);

    const popularData = await popularRes.json();
    const upcomingData = await upcomingRes.json();

    const popularMovies = popularData.results || [];
    const popularIds = new Set(popularMovies.map((m) => m.id));

    setMovies(popularMovies);
    setCOSMovies(upcomingData.results.filter((m) => !popularIds.has(m.id)) || []);

    setLoading(false);
    setCOSLoading(false);
  };

  fetchMovies();
}, []);




  // Just change the code in the css file for the className targets I added here to style this section
  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Leave movie night to us</h1>
          <p>Choose a genre. Spin the wheel. Discover your next favorite film.</p>
        </div>
      </section>

      {/* Popular Movies Section Header */}
      <section className="popular-section">
        <div className="section-header">
          <h2>Popular This Week</h2>
          <p>The most watched movies from the past 7 days</p>
        </div>
        <div className="movie-grid">
          <div className="movie-scroller" style={{ display: 'flex', overflowX: 'auto', gap: '15px', overflowY: 'hidden'}}>
          {loading ? (
            <p>Loading movies...</p>
          ) : (
            movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <img 
                  src={movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'https://placehold.co/500x750?text=No+Poster'}
                  onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
                  alt={movie.title}
                  className="movie-poster"
                  style={{ width: '100%', borderRadius: '8px' }} 
                />
                <div className="movie-info">
                   <h3>{movie.title}</h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      </section>

      <section className="upcoming-section">
        <div className="upcoming-content">
          <h1>Coming Soon</h1>
          <p>Highly anticipated releases</p>
        </div>

        <div className="movie-grid">
          <div className="movie-scroller" style={{ display: 'flex', overflowX: 'auto', gap: '15px', overflowY: 'hidden'}}>
          {COSLoading ? (
            <p>Loading movies...</p>
          ) : (
            COSmovies.map((COSmovies) => (
              <div key={COSmovies.id} className="movie-card">
                <img 
                  src={COSmovies.poster_path
                    ? `https://image.tmdb.org/t/p/w500${COSmovies.poster_path}`
                    : 'https://placehold.co/500x750?text=No+Poster'} 
                  onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
                  alt={COSmovies.title}
                  className="movie-poster"
                  style={{ width: '100%', borderRadius: '8px' }} 
                />
                <div className="movie-info">
                   <h3>{COSmovies.title}</h3>
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </section>
    </main>
  );
}