import React, { useEffect, useState } from 'react';
import './Trending.css';

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading trending content...</p>;

  const featuredMovie = movies[0];

  return (
   <div style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingBottom: '2rem', textAlign: 'center' }}>

    {featuredMovie && (
        <div className="featured-movie" style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 60%, #111 100%), url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`,
        }}>
          <h1 className="h1-trending">{featuredMovie.title}</h1>
        </div>
      )}
      
      <h2>Trending Movies</h2>
      <div className="movie-scroller">
        {movies.map((movie) => (
          <div className="poster-placeholder-trending" key={movie.id}>
            <img 
              className='cardimg'
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
              alt={movie.title} 
            />
            <p><strong>{movie.title}</strong></p>
          </div>
        ))}
      </div>

      <h2>Trending People</h2>
      <div className="movie-scroller">
        {people.map((person) => (
          <div className="poster-placeholder-trending" key={person.id}>
            <img 
              className='cardimg'
              src={person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : 'https://placehold.co/200x300?text=No+Image'}
              alt={person.name} 
            />
            <p><strong>{person.name}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}