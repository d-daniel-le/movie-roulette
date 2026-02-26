export default function Home() {
  // Placeholder for api data of popular movies on homepage - we can change this later if we want more/less movies displayed
  const mockPopularMovies = [
    { id: 1, title: "Movie 1", posterPath: "placeholder1.jpg" },
    { id: 2, title: "Movie 2", posterPath: "placeholder2.jpg" },
    { id: 3, title: "Movie 3", posterPath: "placeholder3.jpg" },
    { id: 4, title: "Movie 4", posterPath: "placeholder4.jpg" },
    { id: 5, title: "Movie 5", posterPath: "placeholder5.jpg" },
  ];

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
          {mockPopularMovies.map((movie) => (
            <div key={movie.id} className="movie-card">
              {/* Popular movies posters */}
              <div className="poster-placeholder">
                <span className="sr-only">{movie.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}