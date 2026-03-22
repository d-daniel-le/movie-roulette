import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [COSLoading, setCOSLoading] = useState(true);
  const [COSmovies, setCOSMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [isUpcoming, setIsUpcoming] = useState(false);

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

      // Filter out movies that haven't been released yet and adult movies
      const releasedMovies = popularData.results.filter(movie => 
        (!movie.release_date || new Date(movie.release_date) <= new Date(today)) &&
        !movie.adult
      );
      const popularMovies = releasedMovies || [];
      const popularIds = new Set(popularMovies.map((m) => m.id));

      setMovies(popularMovies);
      setCOSMovies(upcomingData.results.filter((m) => !popularIds.has(m.id) && !m.adult) || []);

      setLoading(false);
      setCOSLoading(false);
    };

    fetchMovies();
  }, []);

  // Helper to map provider names to search URLs for selected movie
  const getProviderUrl = (providerName, movieTitle) => {
    const q = encodeURIComponent(movieTitle);
    const knownProviders = {
      'Netflix': `https://www.netflix.com/search?q=${q}`,
      'Hulu': `https://www.hulu.com/search?q=${q}`,
      'Prime Video': `https://www.amazon.com/s?k=${q}`,
      'Disney Plus': `https://www.disneyplus.com/search?query=${q}`,
      'Disney+': `https://www.disneyplus.com/search?query=${q}`,
      'Apple TV+': `https://tv.apple.com/search?q=${q}`,
      'Peacock': `https://www.peacocktv.com/search?q=${q}`,
      'YouTube': `https://www.youtube.com/results?search_query=${q}`,
      'Paramount Plus': `https://www.paramountplus.com/search?query=${q}`,
      'Paramount+': `https://www.paramountplus.com/search?query=${q}`,
      'Sky Go': `https://www.sky.com/watch/search?q=${q}`,
      'Crave': `https://www.crave.ca/search?q=${q}`,
    };

    if (knownProviders[providerName]) return knownProviders[providerName];

    return `https://www.google.com/search?q=${encodeURIComponent(`${movieTitle} ${providerName}`)}`;
  };

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
      const [movieRes, providersRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers?language=en-US`, options)
      ]);
      
      const movieData = await movieRes.json();
      const providersData = await providersRes.json();
      
      setMovieDetails({
        ...movieData,
        watchProviders: providersData.results?.US || {}
      });
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
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-content">
            <h1 id="hero-heading">Leave movie night to us</h1>
            <p>Choose a genre. Spin the wheel. Discover your next favorite film.</p>
          </div>
        </section>

        {/* Popular Movies Section Header */}
        <section className="popular-section" aria-labelledby="popular-heading">
          <div className="section-header">
            <h2 id="popular-heading">Popular This Week</h2>
            <p>The most watched movies from the past 7 days</p>
          </div>
          <div className="movie-grid">
            {/* Attached the Ref here */}
            {/* A11Y UPDATE: Added a11y roles to the scroller for keyboard navigation */}
            <div className="movie-scroller" ref={popularScrollRef} role="region" aria-label="Popular Movies Carousel" tabIndex="0">
            {loading ? (
              <p aria-live="polite">Loading movies...</p>
            ) : (
              movies.filter(movie => movie.poster_path).map((movie) => (
                <div 
                  key={movie.id} 
                  className="movie-card" 
                  role="button" 
                  tabIndex="0"
                  aria-label={`View details for ${movie.title}`}
                  onClick={() => {
                    setSelectedMovie(movie);
                    setIsUpcoming(false);
                    fetchMovieDetails(movie.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedMovie(movie);
                      setIsUpcoming(false);
                      fetchMovieDetails(movie.id);
                    }
                  }}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={`Poster of ${movie.title}`}
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

        <section className="upcoming-section" aria-labelledby="upcoming-heading">
          <div className="upcoming-content">
            <h2 id="upcoming-heading">Coming Soon</h2>
            <p>Highly anticipated releases</p>
          </div>

          <div className="movie-grid">
            {/* Attached the Ref here */}
            {/* A11Y UPDATE: Added a11y roles to the scroller for keyboard navigation */}
            <div className="movie-scroller" ref={upcomingScrollRef} role="region" aria-label="Upcoming Movies Carousel" tabIndex="0">
            {COSLoading ? (
              <p aria-live="polite">Loading movies...</p>
            ) : (
              COSmovies.filter(upcomingMovie => upcomingMovie.poster_path).map((upcomingMovie) => (
                <div 
                  key={upcomingMovie.id} 
                  className="movie-card" 
                  role="button" 
                  tabIndex="0"
                  aria-label={`View details for ${upcomingMovie.title}`}
                  onClick={() => {
                    setSelectedMovie(upcomingMovie);
                    setIsUpcoming(true);
                    fetchMovieDetails(upcomingMovie.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedMovie(upcomingMovie);
                      setIsUpcoming(true);
                      fetchMovieDetails(upcomingMovie.id);
                    }
                  }}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${upcomingMovie.poster_path}`}
                    alt={`Poster of ${upcomingMovie.title}`}
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

      {/* A11Y UPDATE: Added dialog roles for the modal */}
      {selectedMovie && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <span 
              className="close" 
              role="button" 
              tabIndex="0" 
              aria-label="Close dialog"
              onClick={() => {
                setSelectedMovie(null);
                setMovieDetails(null);
                setIsUpcoming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedMovie(null);
                  setMovieDetails(null);
                  setIsUpcoming(false);
                }
              }}
            >&times;</span>
            <div className="modal-movie-details">
              <img 
                src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                alt={`Poster of ${selectedMovie.title}`}
                className="modal-movie-poster"
              />
              <div className="modal-movie-info">
                <h2 id="modal-title">{selectedMovie.title}</h2>
                <div className="movie-details">
                  <p className="release-date"><strong>Release Date:</strong> {selectedMovie.release_date ? new Date(selectedMovie.release_date).toLocaleDateString() : 'Unknown'}</p>
                  <p className="movie-genres"><strong>Genres:</strong> {movieDetails?.genres ? movieDetails.genres.map(g => g.name).join(', ') : 'Loading...'}</p>
                  <p className="movie-runtime"><strong>Runtime:</strong> {movieDetails?.runtime ? `${movieDetails.runtime} minutes` : 'Loading...'}</p>
                </div>
                <p className="movie-overview">{selectedMovie.overview || 'No description available.'}</p>

                {/* Watch Providers Section */}
                {!isUpcoming && movieDetails?.watchProviders && (
                  <div className="watch-providers">
                    <h3>Where to Watch</h3>
                    {movieDetails.watchProviders.flatrate && (
                      <div className="provider-group">
                        <strong>Stream</strong>
                        <div className="provider-list">
                          {movieDetails.watchProviders.flatrate
                            .map((provider) => (
                            <a key={provider.provider_id} className="provider-item" href={getProviderUrl(provider.provider_name, selectedMovie?.title || movieDetails?.title || '')} target="_blank" rel="noopener noreferrer" title={provider.provider_name}>
                              {provider.logo_path && (
                                <img 
                                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                                  alt={provider.provider_name}
                                />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {movieDetails.watchProviders.rent && (
                      <div className="provider-group">
                        <strong>Rent</strong>
                        <div className="provider-list">
                          {movieDetails.watchProviders.rent
                            .map((provider) => (
                            <a key={provider.provider_id} className="provider-item" href={getProviderUrl(provider.provider_name, selectedMovie?.title || movieDetails?.title || '')} target="_blank" rel="noopener noreferrer" title={provider.provider_name}>
                              {provider.logo_path && (
                                <img 
                                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                                  alt={provider.provider_name}
                                />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {movieDetails.watchProviders.buy && (
                      <div className="provider-group">
                        <strong>Buy</strong>
                        <div className="provider-list">
                          {movieDetails.watchProviders.buy
                            .map((provider) => (
                            <a key={provider.provider_id} className="provider-item" href={getProviderUrl(provider.provider_name, selectedMovie?.title || movieDetails?.title || '')} target="_blank" rel="noopener noreferrer" title={provider.provider_name}>
                              {provider.logo_path && (
                                <img 
                                  src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                                  alt={provider.provider_name}
                                />
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}