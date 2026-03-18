import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [COSLoading, setCOSLoading] = useState(true);
  const [COSmovies, setCOSMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);

  // 1. Create Refs for the scrollable containers
  const popularScrollRef = useRef(null);
  const upcomingScrollRef = useRef(null);

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

      // Filter out movies that haven't been released yet
      const releasedMovies = popularData.results.filter(movie => 
        !movie.release_date || new Date(movie.release_date) <= new Date(today)
      );
      const popularMovies = releasedMovies || [];
      const popularIds = new Set(popularMovies.map((m) => m.id));

      setMovies(popularMovies);
      setCOSMovies(upcomingData.results.filter((m) => !popularIds.has(m.id)) || []);

      setLoading(false);
      setCOSLoading(false);
    };

    fetchMovies();
  }, []);

  // Function to fetch detailed movie information
  const fetchMovieDetails = async (movieId) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}`
      }
    };

    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options);
      const data = await response.json();
      setMovieDetails(data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  // 2. Add the Mouse Wheel Scroll Effect
  useEffect(() => {
    const handleWheelScroll = (e) => {
      // If moving the scroll wheel vertically...
      if (e.deltaY !== 0) {
        e.preventDefault(); // Stop the whole page from scrolling down
        e.currentTarget.scrollLeft += e.deltaY; // Move the carousel sideways instead
      }
    };

    const popRef = popularScrollRef.current;
    const upRef = upcomingScrollRef.current;

    // We use { passive: false } so preventDefault() is allowed to block the page scroll
    if (popRef) popRef.addEventListener('wheel', handleWheelScroll, { passive: false });
    if (upRef) upRef.addEventListener('wheel', handleWheelScroll, { passive: false });

    return () => {
      if (popRef) popRef.removeEventListener('wheel', handleWheelScroll);
      if (upRef) upRef.removeEventListener('wheel', handleWheelScroll);
    };
  }, [loading, COSLoading]); // Re-attach if loading state changes the DOM

  return (
    <>
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
            {/* Attached the Ref here */}
            <div className="movie-scroller" ref={popularScrollRef}>
            {loading ? (
              <p>Loading movies...</p>
            ) : (
              movies.map((movie) => (
                <div key={movie.id} className="movie-card" onClick={() => {
                  setSelectedMovie(movie);
                  fetchMovieDetails(movie.id);
                }}>
                  <img 
                    src={movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : 'https://placehold.co/500x750?text=No+Poster'}
                    onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
                    alt={movie.title}
                    className="movie-poster"
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
            {/* Attached the Ref here */}
            <div className="movie-scroller" ref={upcomingScrollRef}>
            {COSLoading ? (
              <p>Loading movies...</p>
            ) : (
              COSmovies.map((upcomingMovie) => (
                <div key={upcomingMovie.id} className="movie-card" onClick={() => {
                  setSelectedMovie(upcomingMovie);
                  fetchMovieDetails(upcomingMovie.id);
                }}>
                  <img 
                    src={upcomingMovie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${upcomingMovie.poster_path}`
                      : 'https://placehold.co/500x750?text=No+Poster'} 
                    onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
                    alt={upcomingMovie.title}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                     <h3>{upcomingMovie.title}</h3>
                  </div>
                </div>
              ))
            )}
            </div>
          </div>
        </section>
      </main>

      {selectedMovie && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => {
              setSelectedMovie(null);
              setMovieDetails(null);
            }}>&times;</span>
            <div className="modal-movie-details">
              <img 
                src={selectedMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                  : 'https://placehold.co/500x750?text=No+Poster'}
                onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
                alt={selectedMovie.title}
                className="modal-movie-poster"
              />
              <div className="modal-movie-info">
                <h2>{selectedMovie.title}</h2>
                <div className="movie-details">
                  <p className="release-date"><strong>Release Date:</strong> {selectedMovie.release_date ? new Date(selectedMovie.release_date).toLocaleDateString() : 'Unknown'}</p>
                  <p className="movie-genres"><strong>Genres:</strong> {movieDetails?.genres ? movieDetails.genres.map(g => g.name).join(', ') : 'Loading...'}</p>
                  <p className="movie-runtime"><strong>Runtime:</strong> {movieDetails?.runtime ? `${movieDetails.runtime} minutes` : 'Loading...'}</p>
                </div>
                <p className="movie-overview">{selectedMovie.overview || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}