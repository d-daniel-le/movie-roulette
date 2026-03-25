import { FaEnvelope, FaLock } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import './Login.css'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import ErrorMessage from "../components/ErrorMessage";

function Login(props){
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [logErrorMessage, setLogErrorMessage] = useState("")
    const [hiddenLogErrorMessage, setHiddenLogErrorMessage] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate();
    const signInUser = async (event) =>{
        event.preventDefault()
        if (isSubmitting) {
            return
        }
        setIsSubmitting(true);
        
        try{
            const userCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            const user = userCred.user;
            
            const userInfo = doc(db, "userinfo", user.uid)
            const getUser = await getDoc(userInfo)

            if(!getUser.exists()){
                await setDoc(doc(db, "userinfo", `${user.uid}`), {
                    userID: user.uid,
                    username: user.displayName,
                    email: user.email    
                })
            }
            setLogErrorMessage("")
            setHiddenLogErrorMessage(true)
            navigate("/")
            console.log(user)


        }
        catch(error){
            setLogErrorMessage(error.code)
            setHiddenLogErrorMessage(false)
            setLoginPassword("")
            console.log(error)
        }
        finally {
            setIsSubmitting(false)
        }
    }


    return (
        <div className="login-outer-container">
            <div className="login-container">
                <h2>Sign in</h2>
                {/* <p className="error-message" hidden={hiddenLogErrorMessage}>{logErrorMessage}</p> */}
                {!hiddenLogErrorMessage && <ErrorMessage message={logErrorMessage}/>}
                <form className="login-form" onSubmit={signInUser}>
                    <div className="login-email-outercontainer">
                        <label htmlFor="email-input" id="login-username-label">Email Address</label>
                        <div className="login-email-container">
                            <FaEnvelope className="email-input-icon" />
                            <input id="email-input" type="email" placeholder="youremail@domain.com" value={loginEmail} onChange={(event) => {setLoginEmail(event.target.value)}}/> 
                        </div>

                    </div>

                    <div className="login-password-outercontainer">
                        <label htmlFor="log-password-input" id="login-password-label">Password</label>
                        <div className="login-password-container">
                            <FaLock className="password-input-icon"/>
                            <input id="log-password-input" type="password" placeholder="Enter your Password" value={loginPassword} onChange={(event)=>{setLoginPassword(event.target.value)}}/>                    
                        </div>

                    </div>
                    <button className="login-btn" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login to HomePage"}</button>
                </form>
                
                <div className="create-account-container">            
                    <p>Don't have an account?</p>
                    <Link id="create-account-btn" to="/register">Create an Account</Link>
                </div>
            </div>
        </div>
    )
}

export default Login