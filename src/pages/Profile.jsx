import { AuthContext } from "../components/AuthProvider";
import { useContext, useEffect, useState } from "react";
import "./Profile.css"
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updateEmail, updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function Profile(){
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
                displayName : currentDisplayNameValue
            })
            await updateDoc(doc(db, "userinfo", user.uid), {
                username: currentDisplayNameValue,
                email: currentEmailValue
            })

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
        try{
            if(currentDisplayNameValue && currentDisplayNameValue.trim() !== user.displayName.trim()){
                await updateProfile(user, {
                    displayName : currentDisplayNameValue
                })    
    
            }

            if(currentEmailValue && currentEmailValue.trim() !== user.email.trim()){
                await updateEmail(user, currentEmailValue.trim())
                setEmailErrorMessage("")
                setHiddenEmailErrorMessage(true)
            }

            await updateDoc(doc(db, "userinfo", user.uid), {
                username: currentDisplayNameValue,
                email: currentEmailValue
            })


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
            // console.log(user)
        }
    }, [user])

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
                    <button className="watched-history" onClick={setWatchedContentHidden}>Watched History</button>

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
                    <p>Watch History Content</p>
                </div>

            </div>
        </nav>
    )
}

export default Profile;