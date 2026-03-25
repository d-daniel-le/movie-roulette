import { AuthContext } from "../components/AuthProvider";
import { useContext, useEffect, useState, useRef } from "react";
import "./Profile.css"
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updateEmail, updateProfile } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Profile(){

    // Component State
    const [hiddenMyInfo, setHiddenMyInfo] = useState(false);
    const [hiddenWatchedContent, setHiddenWatchedContent] = useState(true);
    const [currentlyEdit, setCurrentlyEdit] = useState(false);
    const { user } = useContext(AuthContext);
    const [currentDisplayNameValue, setCurrentDisplayNameValue] = useState("")
    const [currentEmailValue, setCurrentEmailValue] = useState("")
    const [emailErrorMessage, setEmailErrorMessage] = useState("")
    const [hiddenEmailErrorMessage, setHiddenEmailErrorMessage] = useState(true)
    const [reauthAccount, setReauthAccount] = useState(false)
    const [reauthPassword, setReauthPassword] = useState("")
    const [reauthPasswordMessage, setReauthPasswordMessage] = useState("")
    const [hiddenReauthPasswordMessage, setHiddenReauthPasswordMessage] = useState(true)
    const [usernameErrorMessage, setUsernameErrorMessage] = useState("")
    const [hiddenUsernameErrorMessage, setHiddenUsernameErrorMessage] = useState(true)
    const [chosenMovie, setChosenMovie] = useState([])
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [movieDetails, setMovieDetails] = useState(null);
    const [deleteAccount, setDeleteAccount] = useState(false)
    const [hiddenDeleteReauthenticateAccount, setHiddenDeleteReauthenticateAccount] = useState(false)
    const [deleteErrorMessage, setDeleteErrorMessage] = useState("")
    const [hiddenDeleteErrorMessage, setHiddenDeleteErrorMessage] = useState(true)

    const profileMoviesRef = useRef(null);

    // 2. Add the Mouse Wheel Scroll Effect
      useEffect(() => {
        const handleWheelScroll = (e) => {
          // If moving the scroll wheel vertically...
          if (e.deltaY !== 0) {
            e.preventDefault(); // Stop the whole page from scrolling down
            e.currentTarget.scrollLeft += e.deltaY; // Move the carousel sideways instead
          }
        };
    
        const movieHistoryRef = profileMoviesRef.current;
    
        if (movieHistoryRef) movieHistoryRef.addEventListener('wheel', handleWheelScroll, { passive: false });
    
        return () => {
          if (movieHistoryRef) movieHistoryRef.removeEventListener('wheel', handleWheelScroll);
        };
      }, );
    
    
    // Initialize Selected Movies Ordered by Date object 
    const [orderedByDate, setOrderedByDate] = useState({})

    // Initialize Navigate
    const navigate = useNavigate()

    // My Information button - click function
    const setMyInfoHidden = () =>{
        setHiddenMyInfo(false)
        setHiddenWatchedContent(true)
    }

    // Watched Information button - click function
    const setWatchedContentHidden = () => {
        setHiddenWatchedContent(false)
        setHiddenMyInfo(true)
    }

    // Edit Information button - click function
    const setEditInformation = () =>{
        setCurrentlyEdit(true)
        setEmailErrorMessage("")
        setHiddenEmailErrorMessage(true)
        setUsernameErrorMessage("")
        setHiddenUsernameErrorMessage(true)
        setReauthPassword("")
        setReauthPasswordMessage("")
        setHiddenReauthPasswordMessage(true)
        setReauthAccount(false)
        setCurrentDisplayNameValue(user.displayName)
        setCurrentEmailValue(user.email)
    }
    
    // Cancel Edit button - click function
    const setCancelEdit = () =>{
        setCurrentlyEdit(false)
        setEmailErrorMessage("")
        setHiddenEmailErrorMessage(true)
        setUsernameErrorMessage("")
        setHiddenUsernameErrorMessage(true)
        setReauthPassword("")
        setReauthPasswordMessage("")
        setHiddenReauthPasswordMessage(true)
        setReauthAccount(false)
        setCurrentDisplayNameValue(user.displayName)
        setCurrentEmailValue(user.email)
    }

    // Delete Button - click button
    const deleteUser = () =>{
        setDeleteAccount(true)
    }

    const noDeleteUser = () =>{
        setDeleteAccount(false)
    }

    const yesDeleteUser = async () =>{
        setDeleteAccount(false)

        try{
            const collectionData = await getDocs(collection(db, "userinfo", user.uid, "history"))

            for (const document of collectionData.docs){
                await deleteDoc(document.ref)
            }

            await deleteDoc(doc(db, "userinfo", `${user.uid}`))
            await user.delete()

            setDeleteErrorMessage("")
            setHiddenDeleteErrorMessage(true)

            navigate("/register")

        }
        catch(error){
            if(error.code === "auth/requires-recent-login"){
                setHiddenDeleteReauthenticateAccount(true)
                setDeleteAccount(false)
            }
            else if (error.code === "auth/network-request-failed"){
                setDeleteErrorMessage("Oops...Network Error")
                setHiddenDeleteErrorMessage(false)
            }
            else{
                console.log(error)
            }
        }

    }

    const deleteReauthenticateAccount = async (event) =>{
        event.preventDefault()
        try{
            const credential = EmailAuthProvider.credential(
                user.email,
                reauthPassword
            )
            await reauthenticateWithCredential(user, credential)

            setReauthPasswordMessage("")
            setHiddenReauthPasswordMessage(true)
            setReauthPassword("")
            setHiddenDeleteReauthenticateAccount(false)
            setDeleteAccount(true)
    }
        catch (error){
            setReauthPasswordMessage(error.code)
            setHiddenReauthPasswordMessage(false)
            console.log(error)
        }
    }


    // Reauthenticate Account when firebase throw an error to reauthenticate
    const reauthenticateAccount = async (event) =>{
        event.preventDefault()
        try{
            const credential = EmailAuthProvider.credential(
                user.email,
                reauthPassword
            )
            await reauthenticateWithCredential(user, credential)
            await updateEmail(user, currentEmailValue.trim())
            await updateProfile(user, {
                displayName : currentDisplayNameValue.trim()
            })
            await updateDoc(doc(db, "userinfo", user.uid), {
                username: currentDisplayNameValue.trim(),
                email: currentEmailValue.trim()
            })

            setUsernameErrorMessage("")
            setHiddenUsernameErrorMessage(true)
            setEmailErrorMessage("")
            setHiddenEmailErrorMessage(true)
            setReauthPasswordMessage("")
            setHiddenReauthPasswordMessage(true)
            setReauthPassword("")
            setCurrentlyEdit(false)
            setReauthAccount(false)            
    }
        catch (error){
            setReauthPasswordMessage(error.code)
            setHiddenReauthPasswordMessage(false)
            console.log(error)
        }
    }

    // Save Edit button - click function
    const setSaveEdit = async () =>{
        setUsernameErrorMessage("")
        setHiddenUsernameErrorMessage(true)
        setEmailErrorMessage("")
        setHiddenEmailErrorMessage(true)

        try{
            if (!currentDisplayNameValue.trim()){
                setUsernameErrorMessage("Invalid username")
                setHiddenUsernameErrorMessage(false)
                return
            }
            else if(currentDisplayNameValue && currentDisplayNameValue.trim() !== user.displayName.trim()){
                await updateProfile(user, {
                    displayName : currentDisplayNameValue.trim()
                })    
    
            }

            if(!currentEmailValue.trim()){
                setEmailErrorMessage("Invalid email")
                setHiddenEmailErrorMessage(false)
                return
            }
            else if(currentEmailValue && currentEmailValue.trim() !== user.email.trim()){
                await updateEmail(user, currentEmailValue.trim())
                setEmailErrorMessage("")
                setHiddenEmailErrorMessage(true)
            }

            await updateDoc(doc(db, "userinfo", user.uid), {
                username: currentDisplayNameValue.trim(),
                email: currentEmailValue.trim()
            })

            setEmailErrorMessage("")
            setHiddenEmailErrorMessage(true)
            setUsernameErrorMessage("")
            setHiddenUsernameErrorMessage(true)
            setCurrentlyEdit(false)
            setReauthAccount(false)

        }
        catch (error){
            if (error.code === "auth/requires-recent-login"){
                setEmailErrorMessage("")
                setHiddenEmailErrorMessage(true)
                setReauthAccount(true)
                setCurrentlyEdit(true)
            }
            else if (error.code === "auth/invalid-email"){
                setEmailErrorMessage("Invalid Email")
                setHiddenEmailErrorMessage(false)
                setCurrentlyEdit(true)
            }
            else if (error.code === "auth/email-already-in-use"){
                setEmailErrorMessage("Email is already used in a different account")
                setHiddenEmailErrorMessage(false)
                setCurrentlyEdit(true)
            }
            else if (error.code === "auth/network-request-failed"){
                setEmailErrorMessage("Something happened to your request. Please try again!")
                setHiddenEmailErrorMessage(false)
                setCurrentlyEdit(true)
            }
            else{
                setEmailErrorMessage("Something went wrong. Please try again!")
                setHiddenEmailErrorMessage(false)
                setCurrentlyEdit(true)
            }
            console.log(error)
        }
    }

    // Sign Out User - click function
    const signOutUser = async () =>{
        try{
            await signOut(auth)
            navigate("/login")
        }
        catch (error){
            console.log(error.code)
        }
    }


    useEffect(()=>{
        if (user){
            setCurrentDisplayNameValue(`${user.displayName}`)
            setCurrentEmailValue(`${user.email}`)
        }
    }, [user])

    // Get Movie

    useEffect(()=>{

        const readDoc = async ()=>{
            const getDocuments = await getDocs(collection(db, "userinfo", user.uid, "history"))
            const movies = getDocuments.docs.map((document) => {
                const documentData = document.data()

                return{
                    ...documentData.movie,
                    retrievedDate: documentData.retrievedDate?.toDate()
                }
            })
            setChosenMovie(movies)
        }

        if(user){
            readDoc()
        }
        
    },[user])

    useEffect( () => {
        // Order Spinned Movie By Date

        const movieGroup = {}

        chosenMovie.forEach((movie)=>{
            const date = movie.retrievedDate ? movie.retrievedDate.toDateString() : "Previous Spinned"
    
            if (!movieGroup[date]){
                movieGroup[date] = []
            }

            movieGroup[date].push(movie)
    
        })

        setOrderedByDate(movieGroup)


    }, [chosenMovie])

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

    if (!user){
        return <p>Loading User...</p>
    }


    
    return(
        <nav className="profile-nav">

            {/* Side Navigation */}
            <div className="profile-sidenav">
                <div className="profile-name">
                    <h2>{user.displayName}</h2>
                </div>
                
                <div className="profile-sidenav-btn">
                    
                    <button className="my-information" onClick={setMyInfoHidden}>My Information</button>
                    <button className="watched-history" onClick={setWatchedContentHidden}>Spin History</button>

                    <hr />
                    <button className="profile-logout-btn" onClick={signOutUser}>Logout</button>
                    
                </div>
            </div>

            {/* Content when Buttons are clicked */}

            <div className="profile-content">
                
                <div className="profile-my-info" hidden={hiddenMyInfo}>

                    {/* User account information */}
                    <div className="profile-my-info-title">
                        <h3>Account Information</h3>

                    </div>

                    <div className="user-account-information">
                        <dl>
                            <div className="user-account-name">
                                <p hidden={hiddenUsernameErrorMessage}>{usernameErrorMessage}</p>
                                <dt>Name:</dt>
                                {currentlyEdit? <input className={hiddenUsernameErrorMessage? "" : "invalid-username"} type="text" value={currentDisplayNameValue} onChange={(event)=>{setCurrentDisplayNameValue(event.target.value)}}/> : <dd>{user.displayName}</dd>}                                

                            </div>

                            <div className="user-account-email">
                                <p hidden={hiddenEmailErrorMessage}>{emailErrorMessage}</p>
                                <dt>Email:</dt>
                                {currentlyEdit? <input className={hiddenEmailErrorMessage? "" : "invalid-email"} type="email" value={currentEmailValue} onChange={(event)=>{setCurrentEmailValue(event.target.value)}}/> : <dd>{user.email}</dd>}  
                            </div>

                            {/* Only show the password part when the user make an edit to the email */}
                            {
                                reauthAccount? 
                                <div className="reauth-container">
                                    <p>Please verify your password:</p>
                                    <div className="reauth-password">
                                        <p hidden={hiddenReauthPasswordMessage}>{reauthPasswordMessage}</p>
                                        <dt>Password:</dt>
                                        <input type="password" value={reauthPassword} onChange={(event) => {setReauthPassword(event.target.value)}}/>
                                        <button onClick={reauthenticateAccount}>Verify</button>
                                    </div>
                                </div> : null
                            }

                            <div className="user-account-date-created">
                                <dt>Account Created:</dt>
                                <dd>{user.metadata.creationTime}</dd>
                            </div>
                        </dl>

                        <div className="user-account-information-btns">
                            <button hidden={currentlyEdit} onClick={setEditInformation}>Edit Information</button>
                            <button hidden={currentlyEdit} onClick={deleteUser}>Delete Account</button>
                        </div>

                        <div className="save-cancel-edit">
                            <button hidden={!currentlyEdit || reauthAccount} onClick={setSaveEdit}>Save</button>
                            <button hidden={!currentlyEdit || reauthAccount} onClick={setCancelEdit}>Cancel</button>
                        </div>

                        {
                            deleteAccount && (
                                <div className="modal-delete" role="dialog" aria-modal="true" aria-labelledby="modal-delete-title">
                                    <div className="modal-delete-content">
                                        <p hidden={hiddenDeleteErrorMessage}>{deleteErrorMessage}</p>

                                        <div className="modal-delete-movie-details">
                                            <p>Are you sure you want to delete your account?</p>
                                            <div className="delete-confirmation-btn-container">
                                                <button onClick={yesDeleteUser}>Yes</button>
                                                <button onClick={noDeleteUser}>No</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            hiddenDeleteReauthenticateAccount && (
                                <div className="modal-delete" role="dialog" aria-modal="true" aria-labelledby="modal-delete-title">
                                    <div className="modal-delete-content">
                                        <div className="modal-delete-movie-details">
                                            <p hidden={hiddenReauthPasswordMessage}>{reauthPasswordMessage}</p>
                                            <dt>Password:</dt>
                                            <input type="password" value={reauthPassword} onChange={(event) => {setReauthPassword(event.target.value)}}/>
                                            <button onClick={deleteReauthenticateAccount}>Verify</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    </div>
                    
                </div>

                {/* User Spinned/Watched History */}
                <div className="profile-watched-content" hidden={hiddenWatchedContent}>

                    <div className="profile-watched-history">
                        <h3>Spin History</h3>
                    </div>

                    <div className="spin-date-container">
                        {
                            Object.entries(orderedByDate).sort(([firstDate], [secondDate])=>{
                                if (firstDate === "Previous Spinned"){
                                    return 1
                                }
                                if (secondDate === "Previous Spinned"){
                                    return -1
                                }
                                return new Date(secondDate) - new Date(firstDate)
                            }).map(([date, movies])=>(
                                <div className="movie-scroller-history" key={date}>

                                    <div className="spin-date">
                                        <p>{date}</p>
                                    </div>

                                    {/* CHANGED: Wrapped the mapped movies in a new 'history-movies-row' div so the date above isn't forced into the horizontal scroll row */}
                                    <div className="history-movies-row" ref={profileMoviesRef}>
                                        {
                                            movies.map((movie) =>(
                                                <div 
                                                    className="poster-placeholder-history" 
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
                                                    alt={movie.title} 
                                                    />
                                                    <p><strong>{movie.title}</strong></p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                        
                                </div>
                            ))
                        }
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

                </div>

            </div>
        </nav>
    )
}

export default Profile;