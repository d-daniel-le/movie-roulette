import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

export default function Wheel() {
  // 1. STATE MANAGEMENT
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

  // 1.5 NAVIGATION & AUTH
  const navigate = useNavigate();
  const auth = getAuth();

  // 2. REFS FOR SCROLLING, WHEEL MEASUREMENT, AND AUDIO
  const resultSectionRef = useRef(null);
  const wheelRef = useRef(null);
  const clickAudio = useRef(typeof Audio !== "undefined" ? new Audio('/tick.mp3') : null);

  // Helper to toggle checkbox selections in arrays
  const toggleSelection = (setter, stateArray, value) => {
    if (stateArray.includes(value)) {
      setter(stateArray.filter(item => item !== value));
    } else {
      setter([...stateArray, value]);
    }
  };

  // Helper to toggle accordion sections open and closed
  const toggleAccordion = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 3. THE SPIN SEQUENCE LOGIC
  const handleSpinClick = async () => {
    
    // --- AUTHENTICATION GUARD ---
    if (!auth.currentUser) {
      alert("You need to log in or register to spin the Roulette Wheel!");
      navigate('/register'); 
      return; 
    }

    if (spinPhase === 'fetching' || spinPhase === 'spinning') return;

    setWinner(null);
    setSpinPhase('fetching');

    const token = import.meta.env.VITE_TMDB_API_TOKEN_AUTH; 
    let baseUrl = `https://api.themoviedb.org/3/discover/movie?language=en-US&sort_by=popularity.desc`;

    if (selectedGenres.length > 0) baseUrl += `&with_genres=${selectedGenres.join('|')}`;
    if (selectedCerts.length > 0) baseUrl += `&certification_country=US&certification=${selectedCerts.join('|')}`;
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings.map(r => parseInt(r)));
      baseUrl += `&vote_average.gte=${minRating}`;
    }
    if (selectedDecades.length > 0) {
      const years = selectedDecades.map(d => parseInt(d));
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years) + 9;
      baseUrl += `&primary_release_date.gte=${minYear}-01-01&primary_release_date.lte=${maxYear}-12-31`;
    }

    const fetchOptions = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`
      }
    };

    try {
      // Fetch page 1 to see how many total pages of movies match these filters
      const initialResponse = await fetch(`${baseUrl}&page=1`, fetchOptions);
      const initialData = await initialResponse.json();
      
      if (initialData.results && initialData.total_results >= 10) {
        
        // Pick a random page from the results
        const maxPage = Math.min(initialData.total_pages, 20);
        const randomPage = Math.floor(Math.random() * maxPage) + 1;

        let finalData = initialData;
        
        // Fetch that specific random page if it isn't page 1
        if (randomPage !== 1) {
            const pageResponse = await fetch(`${baseUrl}&page=${randomPage}`, fetchOptions);
            finalData = await pageResponse.json();
        }

        // Robust shuffle of the 20 results
        const shuffledResults = [...finalData.results];
        for (let i = shuffledResults.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledResults[i], shuffledResults[j]] = [shuffledResults[j], shuffledResults[i]];
        }
        
        // Take the top 10 from the freshly randomized deck
        const top10 = shuffledResults.slice(0, 10);
        
        const formattedSpots = top10.map(movie => ({
          title: movie.title,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          isPlaceholder: false
        }));
        
        setWheelSpots(formattedSpots);

        // --- SPIN PHYSICS MATH ---
        const winningIndex = Math.floor(Math.random() * 10);
        
        const rotationsToZero = 360 - (rotation % 360);
        
        const baseSpins = 360 * 6; 
        
        const targetDegree = rotationsToZero + baseSpins + 180 - (winningIndex * 36);
        const newRotation = rotation + targetDegree;
        
        setRotation(newRotation);
        setSpinPhase('spinning');

        // Wait for the 8-second CSS transition to finish before showing the winner
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

  // 4.5 AUDIO TICK EFFECT
  useEffect(() => {
    let animationFrameId;
    let lastWedge = -1;

    const watchWheelRotation = () => {
      if (!wheelRef.current) return;

      const style = window.getComputedStyle(wheelRef.current);
      const matrix = style.getPropertyValue('transform');

      if (matrix !== 'none') {
        const values = matrix.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
        if (angle < 0) angle += 360; 

        const currentWedge = Math.floor(angle / 36);

        if (currentWedge !== lastWedge) {
          if (clickAudio.current) {
            const tickClone = clickAudio.current.cloneNode();
            tickClone.volume = 0.4; 
            tickClone.play().catch(e => console.log("Audio blocked:", e));
          }
          lastWedge = currentWedge;
        }
      }
      
      animationFrameId = requestAnimationFrame(watchWheelRotation);
    };

    if (spinPhase === 'spinning') {
      animationFrameId = requestAnimationFrame(watchWheelRotation);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [spinPhase]);

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
        
        {/* Left Column: Filters */}
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

        {/* Right Column: The Wheel UI */}
        <section className="wheel-display-area">
          <div className="wheel-pointer"></div>
          
          <div 
            className="physical-wheel" 
            ref={wheelRef}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
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

      {/* BOTTOM SECTION: The Celebration Result */}
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