import { FaEnvelope, FaLock } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import './Login.css'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";

function Login(props){
    const [loginEmail, setLoginEmail] = useState("")
    const [loginPassword, setLoginPassword] = useState("")
    const [logErrorMessage, setLogErrorMessage] = useState("")
    const [hiddenLogErrorMessage, setHiddenLogErrorMessage] = useState(true)
    const navigate = useNavigate();
    const signInUser = async (event) =>{
        event.preventDefault()
        
        try{
            const userCred = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            const user = userCred.user;
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
    }


    return (
        <div className="login-outer-container">
            <div className="login-container">
                <h2>Sign in</h2>
                <p className="error-message" hidden={hiddenLogErrorMessage}>{logErrorMessage}</p>
                <form className="login-form" onSubmit={signInUser}>
                    <div className="login-email-outercontainer">
                        <label htmlFor="email-input" id="login-username-label">Username/Email Address</label>
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
                    <button className="login-btn">Login to HomePage</button>
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