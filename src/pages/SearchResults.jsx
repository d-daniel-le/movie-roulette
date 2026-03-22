import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import './SearchResults.css'
import { FaSearch } from "react-icons/fa";

function SearchResults (){
    const [searchQueryValue, setSearchQueryValue] = useState("")
    const [movieResults, setMovieResults] = useState([])
    const [movieDetail, setMovieDetail] = useState({})
    const [movieId, setMovieId] = useState("")
    const [viewMovieDetail, setViewMovieDetail] = useState(false)
    const [providers, setProviders] = useState({})

    // Initialize Movie Streaming Providers array
    const movieStreamingProviders = providers.results?.US?.flatrate || []
    
    // Retrieved the query value from the search in NavBar
    const [queryParameters] = useSearchParams()
    const query = queryParameters.get("q")

    // Instantiate Route Navigate
    const navigate = useNavigate()

    // Submit search on result page
    const submitSearchFunction = (event) =>{
        event.preventDefault()
        navigate(`/results?q=${encodeURIComponent(searchQueryValue)}`)
    }
    
    // Store the right string to query

    useEffect(() =>{
        if (!query){
            setSearchQueryValue("")
        }
        else{
            setSearchQueryValue(query)    

        }
    }, [query])

    // Get Movie Detail
    useEffect(() =>{
        const getMovieDetail = async () => {
            try{
                const movieDetailDataRequest = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    method: "GET",
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}`
                    }
                })

                const movieDetailDataResponse = await movieDetailDataRequest.json()
                setMovieDetail(movieDetailDataResponse)
    
            }
            catch (error){
                console.log(error)
            }
        }

        const getStreamingProviders = async () => {
            try{
                const streamingProvidersDataRequest = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`, {
                    method: "GET",
                    headers: {
                        accept: 'application/json',
                        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}`
                    }
                })
                
                const streamingProvidersDataResponse = await streamingProvidersDataRequest.json()
                setProviders(streamingProvidersDataResponse)


            }
            catch (error){
                console.log(error)
            }
        }

        if (movieId){
            getMovieDetail()
            getStreamingProviders()
        }
    } ,[movieId])

    // Get search results

    useEffect(()=>{
        const getSearchMovie = async () =>{
                try{
                    const movieDataRequest = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchQueryValue}`, {
                        method: "GET",
                        headers: {
                            accept: 'application/json',
                            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_TOKEN_AUTH}`
                        }
                    })
        
                    const movieDataResponse = await movieDataRequest.json()
        
                    setMovieResults(movieDataResponse.results)
        
                }
                catch (error){
                    console.log(error.code)
                }
        }
        
        if(searchQueryValue){
            getSearchMovie()
        }
    }, [searchQueryValue])

    return (
        <div className="search-result-outer-container">
            <div className="search-result-container">
                <div className="result-title">
                    <h1>Search Results</h1>
                </div>

                <form className="search-result-input" onSubmit={submitSearchFunction}>
                    <input type="text" value={searchQueryValue} placeholder="Search" onChange={(event) => {setSearchQueryValue(event.target.value)}}/>
                    <button type="submit" className="icon-btn search-btn" aria-label="Submit search"><FaSearch/></button>
                </form>

                {/* Generate component for the searchresults */}
                <div className="movie-results-celebration-section">
                    {
                        searchQueryValue? movieResults.map((movie) =>(
                            <div className="movie-results-card" onClick={(event) =>{
                                event.preventDefault()
                                setMovieId(movie.id)
                                setViewMovieDetail(true)
                            }} key={movie.id}>
                                <img 
                                src={movie.poster_path? `https://image.tmdb.org/t/p/w200${movie.poster_path}`: 'https://placehold.co/500x750?text=No+Poster'}
                                alt={`Poster for ${movie.title}`} 
                                />
                                <div className="movie-results-details">
                                    <h3>{movie.title} ({movie.release_date? movie.release_date.split("-")[0]:"Unknown"})</h3>
                                    <p>{movie.overview}</p>                    
                                </div>
                            </div>                
                        )):
                        <p>No Search Result</p>
                    }
                </div>

                {
                    viewMovieDetail && (
                        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                            <div className="modal-content">
                                <span 
                                className="close" 
                                role="button" 
                                tabIndex="0" 
                                aria-label="Close dialog"
                                onClick={() => {
                                    setMovieId("")
                                    setProviders({})
                                    setMovieDetail({})
                                    setViewMovieDetail(false)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        setMovieId("")
                                        setProviders({})    
                                        setMovieDetail({})
                                        setViewMovieDetail(false)
                                    }
                                }}
                                >&times;</span>
                                <div className="modal-movie-details">
                                    <img 
                                        src={movieDetail.poster_path
                                        ? `https://image.tmdb.org/t/p/w500${movieDetail.poster_path}`
                                        : 'https://placehold.co/500x750?text=No+Poster'}
                                        onError={(e) => e.target.src = 'https://placehold.co/500x750?text=No+Poster'}
                                        alt={`Poster of ${movieDetail.title}`}
                                        className="modal-movie-poster"
                                    />
                                    <div className="modal-movie-info">
                                        <h2 id="modal-title">{movieDetail.title}</h2>
                                        <div className="movie-details">
                                            <p className="release-date"><strong>Release Date:</strong> {movieDetail.release_date ? new Date(movieDetail.release_date).toLocaleDateString() : 'Unknown'}</p>
                                            <p className="movie-genres"><strong>Genres:</strong> {movieDetail?.genres ? movieDetail.genres.map(g => g.name).join(', ') : 'Loading...'}</p>
                                            <p className="movie-runtime"><strong>Runtime:</strong> {movieDetail?.runtime ? `${movieDetail.runtime} minutes` : 'Loading...'}</p>
                                        </div>
                                        <p className="movie-overview">{movieDetail.overview || 'No description available.'}</p>

                                        {/* Replaced the static button with dynamic streaming providers */}
                                        {movieStreamingProviders && movieStreamingProviders.length > 0 ? (
                                            <div className="streaming-providers">
                                                <h4>Available on:</h4>
                                                <div className="provider-logos">
                                                    {movieStreamingProviders.map(provider => (
                                                    <img 
                                                        key={provider.provider_id} 
                                                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} 
                                                        alt={provider.provider_name} 
                                                        title={provider.provider_name}
                                                        className="provider-logo"
                                                    />
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="streaming-providers">
                                            <h4>Available on:</h4>
                                            <p className="no-providers-text">No subscription streaming data available.</p>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                      )
                }

            </div>
        </div>
    )
}

export default SearchResults;