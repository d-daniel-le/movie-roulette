import React, { useEffect, useState, useRef } from 'react';
import './Trending.css';

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);

  // 1. Create Refs for the scrollable containers
  const trendingMoviesRef = useRef(null);
  const trendingPeopleRef = useRef(null);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}` 
      }
    };

    const fetchMovies = fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options)
      .then(response => response.json());

    const fetchPeople = fetch('https://api.themoviedb.org/3/trending/person/day?language=en-US', options)
      .then(response => response.json());

    Promise.all([fetchMovies, fetchPeople])
      .then(([movieData, peopleData]) => {
        setMovies(movieData.results);
        setPeople(peopleData.results);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. Add the Mouse Wheel Scroll Effect
  useEffect(() => {
    const handleWheelScroll = (e) => {
      // If moving the scroll wheel vertically...
      if (e.deltaY !== 0) {
        e.preventDefault(); // Stop the whole page from scrolling down
        e.currentTarget.scrollLeft += e.deltaY; // Move the carousel sideways instead
      }
    };

    const moviesRef = trendingMoviesRef.current;
    const peopleRef = trendingPeopleRef.current;

    if (moviesRef) moviesRef.addEventListener('wheel', handleWheelScroll, { passive: false });
    if (peopleRef) peopleRef.addEventListener('wheel', handleWheelScroll, { passive: false });

    return () => {
      if (moviesRef) moviesRef.removeEventListener('wheel', handleWheelScroll);
      if (peopleRef) peopleRef.removeEventListener('wheel', handleWheelScroll);
    };
  }, [loading]); // Re-attach if loading state changes the DOM

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

  if (loading) return <p aria-live="polite">Loading trending content...</p>;

  const featuredMovie = movies[0];

  return (
    // Replaced inline styling with a class for mobile CSS control
    <div className="trending-page-container">

      {featuredMovie && (
        <div className="featured-movie" role="region" aria-label="Featured Trending Movie" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 60%, #111 100%), url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`,
        }}>
          <h1 className="h1-trending">{featuredMovie.title}</h1>
        </div>
      )}
      
      <h2>Trending Movies</h2>
      {/* A11Y UPDATE: Added a11y roles to the scroller */}
      <div className="movie-scroller" ref={trendingMoviesRef} role="region" aria-label="Trending Movies Carousel" tabIndex="0">
        {movies.map((movie) => (
          <div 
            className="poster-placeholder-trending" 
            key={movie.id} 
            role="button" 
            tabIndex="0"
            aria-label={`View details for ${movie.title}`}
            onClick={() => {
              setSelectedMovie(movie);
              fetchMovieDetails(movie.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedMovie(movie);
                fetchMovieDetails(movie.id);
              }
            }}
          >
            <img 
              className='cardimg'
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
              alt={`Poster of ${movie.title}`} 
            />
            <p><strong>{movie.title}</strong></p>
          </div>
        ))}
      </div>

      <h2>Trending People</h2>
      <div className="movie-scroller" ref={trendingPeopleRef} role="region" aria-label="Trending People Carousel" tabIndex="0">
        {people.map((person) => (
          <div 
            className="poster-placeholder-trending" 
            key={person.id}
            role="article"
            aria-label={`Trending person: ${person.name}`}
          >
            <img 
              className='cardimg'
              src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://placehold.co/200x300?text=No+Image'}
              alt={`Profile of ${person.name}`} 
            />
            <p><strong>{person.name}</strong></p>
          </div>
        ))}
      </div>

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
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedMovie(null);
                  setMovieDetails(null);
                }
              }}
            >&times;</span>
            <div className="modal-movie-details">
              <img 
                src={selectedMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                  : 'https://placehold.co/500x750?text=No+Poster'}
                onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}