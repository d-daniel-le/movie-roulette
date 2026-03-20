import { AuthContext } from "../components/AuthProvider";
import { useContext, useEffect, useState } from "react";
import "./Profile.css"
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updateEmail, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Profile(){

    // Component STate
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

                        <button hidden={currentlyEdit} onClick={setEditInformation}>Edit Information</button>
                        <div className="save-cancel-edit">
                            <button hidden={!currentlyEdit || reauthAccount} onClick={setSaveEdit}>Save</button>
                            <button hidden={!currentlyEdit || reauthAccount} onClick={setCancelEdit}>Cancel</button>
                        </div>

                    </div>
                    
                </div>

                {/* User Spinned/Watched History */}
                <div className="profile-watched-content" hidden={hiddenWatchedContent}>

                    <div className="profile-watched-history">
                        <h3>Spin History</h3>
                    </div>

                    <div className="spin-date-container">
                        {
                            Object.entries(orderedByDate).map(([date, movies])=>(
                                <div className="movie-scroller-history" key={date}>

                                    <div className="spin-date">
                                        <p>{date}</p>
                                    </div>

                                    {
                                        movies.map((movie) =>(
                                            <div className="poster-placeholder-history" key={movie.id}>
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
                            ))
                        }
                    </div>

                </div>

            </div>
        </nav>
    )
}

export default Profile;