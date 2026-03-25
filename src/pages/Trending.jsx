import React, { useEffect, useState, useRef } from 'react';
import LoadingMessage from '../components/LoadingMessage';
import './Trending.css';

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personDetails, setPersonDetails] = useState(null);

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
        // Filter out adult movies
        const filteredMovies = movieData.results.filter(movie => !movie.adult);
        setMovies(filteredMovies);
        
        // Filter out adult content actors and people known primarily for adult content
        let filteredPeople = peopleData.results.filter(person => 
          !person.adult && 
          (!person.known_for || !person.known_for.some(movie => movie.adult)) &&
          person.known_for_department === 'Acting' && // Only allow actors
          person.name && person.name.trim() && // Filter out entries without valid names
          person.profile_path // Filter out entries without profile pictures
        );

        // Fetch full details for each person to check biography
        const personDetailPromises = filteredPeople.map(person =>
          fetch(`https://api.themoviedb.org/3/person/${person.id}?language=en-US`, options)
            .then(res => res.json())
            .catch(() => null)
        );

        Promise.all(personDetailPromises)
          .then(personDetails => {
            // Filter out people with adult content in their biography
            const cleanedPeople = filteredPeople.filter((person, idx) => {
              const details = personDetails[idx];
              if (!details || !details.biography) return true;
              
              const bioLower = details.biography.toLowerCase();
              const adultKeywords = ['av actress', 'adult model', 'pornographic', 'porn', 'erotic', 'adult video', 'adult film', 'av actor'];
              return !adultKeywords.some(keyword => bioLower.includes(keyword));
            });
            
            setPeople(cleanedPeople);
            setLoading(false);
          });
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
      'Crave': `https://www.crave.ca/search?q=${q}`
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

      if (!movieRes.ok ||!providersRes.ok){
        throw new Error("Load movies was not successful")
      }

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

  // Function to fetch detailed person information
  const fetchPersonDetails = async (personId) => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}`
      }
    };

    try {
      // Fetch person details
      const personResponse = await fetch(`https://api.themoviedb.org/3/person/${personId}?language=en-US`, options);
      const personData = await personResponse.json();
      
      // Try to fetch credits, but don't fail if it doesn't work
      let credits = [];
      try {
        const creditsResponse = await fetch(`https://api.themoviedb.org/3/person/${personId}/combined_credits?language=en-US`, options);
        const creditsData = await creditsResponse.json();
        
        // Filter out adult movies and get top 10 non-adult credits
        credits = (creditsData.cast || [])
          .filter(credit => !credit.adult)
          .slice(0, 10);
      } catch (creditsError) {
        console.log('Could not fetch credits, using fallback');
        // Use known_for from trending data as fallback
        const trendingPerson = people.find(p => p.id === personId);
        credits = trendingPerson?.known_for || [];
      }
      
      setPersonDetails({
        ...personData,
        known_for: credits
      });
    } catch (error) {
      console.error('Error fetching person details:', error);
    }
  };

  if (loading) return <LoadingMessage message="Loading trending content..." />;

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
        {movies.filter(movie => movie.poster_path).map((movie) => (
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
        {people.filter(person => person.profile_path).map((person) => (
          <div 
            className="poster-placeholder-trending" 
            key={person.id}
            role="button" 
            tabIndex="0"
            aria-label={`View details for ${person.name}`}
            onClick={() => {
              setSelectedPerson(person);
              fetchPersonDetails(person.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedPerson(person);
                fetchPersonDetails(person.id);
              }
            }}
          >
            <img 
              className='cardimg'
              src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
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
                
                {/* Watch Providers Section */}
                {movieDetails?.watchProviders && (
                  <div className="watch-providers">
                    <h3>Where to Watch</h3>
                    {movieDetails.watchProviders.flatrate && (
                      <div className="provider-group">
                        <strong>Stream</strong>
                        <div className="provider-list">
                          {movieDetails.watchProviders.flatrate.map((provider) => (
                            <a key={provider.provider_id} className="provider-item" title={provider.provider_name} href={getProviderUrl(provider.provider_name, selectedMovie?.title || movieDetails?.title || '')} target="_blank" rel="noopener noreferrer">
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
                          {movieDetails.watchProviders.rent.map((provider) => (
                            <a key={provider.provider_id} className="provider-item" title={provider.provider_name} href={getProviderUrl(provider.provider_name, selectedMovie?.title || movieDetails?.title || '')} target="_blank" rel="noopener noreferrer">
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
                          {movieDetails.watchProviders.buy.map((provider) => (
                            <a key={provider.provider_id} className="provider-item" title={provider.provider_name} href={getProviderUrl(provider.provider_name, selectedMovie?.title || movieDetails?.title || '')} target="_blank" rel="noopener noreferrer">
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

      {selectedPerson && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="person-modal-title">
          <div className="modal-content">
            <span 
              className="close" 
              role="button" 
              tabIndex="0" 
              aria-label="Close dialog"
              onClick={() => {
                setSelectedPerson(null);
                setPersonDetails(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPerson(null);
                  setPersonDetails(null);
                }
              }}
            >&times;</span>
            <div className="modal-movie-details">
              <img 
                src={selectedPerson.profile_path
                  ? `https://image.tmdb.org/t/p/w500${selectedPerson.profile_path}`
                  : 'https://placehold.co/500x750?text=No+Photo'}
                onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Photo'}
                alt={`Profile of ${selectedPerson.name}`}
                className="modal-movie-poster"
              />
              <div className="modal-movie-info">
                <h2 id="person-modal-title">{selectedPerson.name}</h2>
                <div className="movie-details">
                  {personDetails?.birthday && (
                    <p className="release-date"><strong>Birthday:</strong> {new Date(personDetails.birthday).toLocaleDateString()}</p>
                  )}
                  {personDetails?.place_of_birth && (
                    <p className="movie-genres"><strong>Place of Birth:</strong> {personDetails.place_of_birth}</p>
                  )}
                  {personDetails?.known_for_department && (
                    <p className="movie-runtime"><strong>Known For:</strong> {personDetails.known_for_department}</p>
                  )}
                </div>
                {personDetails?.biography && (
                  <div className="person-biography">
                    <h3>Biography</h3>
                    <p>{personDetails.biography}</p>
                  </div>
                )}
                {personDetails?.known_for && personDetails.known_for.length > 0 && (
                  <div className="person-known-for">
                    <h3>Known For</h3>
                    <div className="known-for-list">
                      {personDetails.known_for.map((credit, index) => (
                        <div key={index} className="known-for-item">
                          <strong>{credit.title || credit.name}</strong>
                          {credit.character && <span> as {credit.character}</span>}
                          {credit.release_date && (
                            <span> ({new Date(credit.release_date).getFullYear()})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}