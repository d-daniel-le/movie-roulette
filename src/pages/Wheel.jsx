import { useState, useRef, useEffect } from 'react';

export default function Wheel() {
  // 1. STATE MANAGEMENT
  // Filter Array States
  const [selectedDecades, setSelectedDecades] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);

  // Accordion Expand State
  const [expanded, setExpanded] = useState({
    decades: true,
    genres: false,
    certs: false,
    ratings: false
  });

  // Wheel & Spin Physics States
  const [wheelSpots, setWheelSpots] = useState(Array(10).fill({ isPlaceholder: true }));
  const [spinPhase, setSpinPhase] = useState('idle'); 
  const [rotation, setRotation] = useState(0); 
  const [winner, setWinner] = useState(null);

  // 2. REFS FOR SCROLLING
  const resultSectionRef = useRef(null);

  const toggleSelection = (setter, stateArray, value) => {
    if (stateArray.includes(value)) {
      setter(stateArray.filter(item => item !== value));
    } else {
      setter([...stateArray, value]);
    }
  };

  const toggleAccordion = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 3. THE SPIN SEQUENCE LOGIC
  const handleSpinClick = async () => {
    if (spinPhase === 'fetching' || spinPhase === 'spinning') return;

    setWinner(null);
    setSpinPhase('fetching');

    const token = import.meta.env.VITE_TMDB_API_TOKEN_AUTH; 
    let url = `https://api.themoviedb.org/3/discover/movie?language=en-US&sort_by=popularity.desc&page=1`;

    if (selectedGenres.length > 0) url += `&with_genres=${selectedGenres.join('|')}`;
    if (selectedCerts.length > 0) url += `&certification_country=US&certification=${selectedCerts.join('|')}`;
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings.map(r => parseInt(r)));
      url += `&vote_average.gte=${minRating}`;
    }
    if (selectedDecades.length > 0) {
      const years = selectedDecades.map(d => parseInt(d));
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years) + 9;
      url += `&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
    }

    const fetchOptions = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      if (data.results && data.results.length >= 10) {
        const top10 = data.results.slice(0, 10);
        
        const formattedSpots = top10.map(movie => ({
          title: movie.title,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          isPlaceholder: false
        }));
        
        setWheelSpots(formattedSpots);

        // --- SPIN PHYSICS MATH ---
        const winningIndex = Math.floor(Math.random() * 10);
        
        const rotationsToZero = 360 - (rotation % 360);
        const baseSpins = 360 * 8; 
        
        const targetDegree = rotationsToZero + baseSpins + 180 - (winningIndex * 36);
        const newRotation = rotation + targetDegree;
        
        setRotation(newRotation);
        setSpinPhase('spinning');

        // Wait for CSS transition to finish before showing the winner
        setTimeout(() => {
          setSpinPhase('finished');
          const winningMovie = top10[winningIndex];
          const imageUrl = winningMovie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${winningMovie.poster_path}` 
            : 'placeholder.jpg';

          setWinner({
            title: winningMovie.title,
            year: winningMovie.release_date ? winningMovie.release_date.split('-')[0] : 'Unknown',
            overview: winningMovie.overview,
            poster: imageUrl 
          });
        }, 8500); 

      } else {
         alert("Not enough movies match those exact filters! Try broadening your search.");
         setSpinPhase('idle');
      }
    } catch (error) {
      console.error("Failed to fetch from TMDB:", error);
      alert("Error connecting to the movie database.");
      setSpinPhase('idle');
    }
  };

  // 4. AUTO-SCROLL EFFECT
  useEffect(() => {
    if (winner && resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [winner]);

  // UI DATA ARRAYS
  const decadesList = ['1970', '1980', '1990', '2000', '2010', '2020'];
  const genresList = [
    { name: 'Action', id: '28' }, { name: 'Adventure', id: '12' }, 
    { name: 'Animation', id: '16' }, { name: 'Comedy', id: '35' }, 
    { name: 'Crime', id: '80' }, { name: 'Drama', id: '18' }, 
    { name: 'Family', id: '10751' }, { name: 'Fantasy', id: '14' }, 
    { name: 'Horror', id: '27' }, { name: 'Mystery', id: '9648' }, 
    { name: 'Romance', id: '10749' }, { name: 'Thriller', id: '53' }
  ];
  const certsList = ['G', 'PG', 'PG-13', 'R'];
  const ratingsList = ['5', '6', '7', '8', '9'];

  // 5. THE UI RENDER
  return (
    <div className="wheel-page-container">
      <div className="wheel-layout-grid">
        
        <aside className="filters-sidebar">
          <h3 style={{ marginBottom: '1.5rem' }}>Set Your Criteria</h3>
          
          <div className="filter-group">
            <div className="filter-accordion-header" onClick={() => toggleAccordion('decades')}>
              <span>Decades</span><span>{expanded.decades ? '▼' : '▶'}</span>
            </div>
            {expanded.decades && (
              <div className="filter-accordion-content">
                {decadesList.map(decade => (
                  <label key={decade} className="checkbox-label">
                    <input type="checkbox" checked={selectedDecades.includes(decade)} onChange={() => toggleSelection(setSelectedDecades, selectedDecades, decade)} />
                    {decade}s
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <div className="filter-accordion-header" onClick={() => toggleAccordion('genres')}>
              <span>Genres</span><span>{expanded.genres ? '▼' : '▶'}</span>
            </div>
            {expanded.genres && (
              <div className="filter-accordion-content">
                {genresList.map(genre => (
                  <label key={genre.id} className="checkbox-label">
                    <input type="checkbox" checked={selectedGenres.includes(genre.id)} onChange={() => toggleSelection(setSelectedGenres, selectedGenres, genre.id)} />
                    {genre.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <div className="filter-accordion-header" onClick={() => toggleAccordion('certs')}>
              <span>Certification</span><span>{expanded.certs ? '▼' : '▶'}</span>
            </div>
            {expanded.certs && (
              <div className="filter-accordion-content">
                {certsList.map(cert => (
                  <label key={cert} className="checkbox-label">
                    <input type="checkbox" checked={selectedCerts.includes(cert)} onChange={() => toggleSelection(setSelectedCerts, selectedCerts, cert)} />
                    {cert}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group">
            <div className="filter-accordion-header" onClick={() => toggleAccordion('ratings')}>
              <span>Minimum Rating</span><span>{expanded.ratings ? '▼' : '▶'}</span>
            </div>
            {expanded.ratings && (
              <div className="filter-accordion-content">
                {ratingsList.map(rating => (
                  <label key={rating} className="checkbox-label">
                    <input type="checkbox" checked={selectedRatings.includes(rating)} onChange={() => toggleSelection(setSelectedRatings, selectedRatings, rating)} />
                    {rating}+ Stars
                  </label>
                ))}
              </div>
            )}
          </div>

          <button className="spin-trigger-btn" onClick={handleSpinClick} disabled={spinPhase === 'fetching' || spinPhase === 'spinning'}>
            {spinPhase === 'idle' || spinPhase === 'finished' ? 'SPIN THE WHEEL' : 'SPINNING...'}
          </button>
        </aside>

        <section className="wheel-display-area">
          <div className="wheel-pointer"></div>
          
          <div className="physical-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
            {wheelSpots.map((spot, index) => (
              <div key={index} className="wheel-slice">
                <div className="slice-content">
                  {spot.isPlaceholder ? (
                    <span className="question-mark">?</span>
                  ) : (
                    <img src={spot.poster} alt={spot.title} className="poster-image" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {winner && (
        <div className="winner-celebration-section" ref={resultSectionRef}>
          <h2>We Have a Winner!</h2>
          <div className="winner-card">
            <img src={winner.poster} alt={`Poster for ${winner.title}`} />
            <div className="winner-details">
              <h3>{winner.title} ({winner.year})</h3>
              <p>{winner.overview}</p>
              <button className="watch-now-btn">Where to Watch</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}