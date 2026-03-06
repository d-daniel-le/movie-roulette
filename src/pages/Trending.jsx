import React, { useEffect, useState } from 'react';

export default function Trending() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}` 
      }
    };

    fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options)
      .then(response => response.json())
      .then(data => {
        setMovies(data.results);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <p>Loading trending movies...</p>;

  const featuredMovie = movies[0];

  return (
   <div style={{ padding: '4rem', textAlign: 'center' }}>

    {featuredMovie && (
        <div style={{
          position: 'relative',
          height: '60vh',
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 60%, #111 100%), url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 4rem'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>{featuredMovie.title}</h1>
        </div>
      )}
      
      <h2>Trending Today</h2>
      <div className="movie-scroller" style={{ display: 'flex', overflowX: 'auto', gap: '15px', overflowY: 'hidden'}}>
        {movies.map((movie) => (
          <div className="poster-placeholder-trending" key={movie.id} style={{ width: '250px' }}>
            <img 
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
              alt={movie.title} 
              style={{ borderRadius: '8px' }}
            />
            <p><strong>{movie.title}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}