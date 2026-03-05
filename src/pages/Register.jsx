import { FaEnvelope, FaLock } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import "./Register.css"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "../firebase"
import { useState } from "react"
import { db } from "../firebase"
import { collection, doc, setDoc } from "firebase/firestore"

function Register(props){
    const navigate = useNavigate()
    const [registerEmail, setRegisterEmail] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    const [regErrorMessage, setErrorMessage] = useState("")
    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("");
    const [hiddenRegErrorMessage, setHiddenRegErrorMessage] = useState(true)

    const createUser = async (event) =>{
        event.preventDefault()

        try{
            // Register User
            const userCred = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
            const user = userCred.user
            await updateProfile(user, {
                displayName: `${firstname} ${lastname}`
            })
            console.log(user)

            // Save User Information to Database
             const userInfo = collection(db, "userinfo")

             await setDoc(doc(userInfo, `${user.uid}`), {
                userID: user.uid,
                username: user.displayName,
                email: user.email,
             })

            setErrorMessage("")
            setHiddenRegErrorMessage(true)
            navigate("/")
        }
        catch(error){
            setErrorMessage(error.code)
            setHiddenRegErrorMessage(false)
            console.log(error)
        }
    }
    return (
        <div className="register-outer-container">
            <div className="register-container">
                <h2>Create an Account</h2>
                <p className="error-message" hidden={hiddenRegErrorMessage}>{regErrorMessage}</p>
                <form className="register-form" onSubmit={createUser}>
                    <div className="user-first-last-outercontainer">
                        <div className="firstname-container">
                            <label htmlFor="firstname-input">First Name</label>
                            <input id="firstname-input" type="text" placeholder="First Name" value={firstname} onChange={(event) => {setFirstname(event.target.value)}}/>
                        </div>
                        <div className="lastname-container">
                            <label htmlFor="lastname-input">Last Name</label>
                            <input id="lastname-input" type="text" placeholder="Last Name" value={lastname} onChange={(event) => {setLastname(event.target.value)}}/>
                        </div>
                    </div>

                    <div className="register-email-outercontainer">
                        <label htmlFor="register-input">Email</label>
                        <div className="register-email-container">
                            <FaEnvelope className="email-input-icon" />
                            <input id="register-input" type="email" placeholder="Enter your email. Ex: youremail@domain.com" value={registerEmail} onChange={(event)=>{setRegisterEmail(event.target.value)}}/>
                        </div>
                    </div>

                    <div className="register-password-outercontainer">
                        <label htmlFor="reg-password-input">Password</label>
                        <div className="register-password-container">
                            <FaLock className="password-input-icon" />
                            <input id="reg-password-input" type="password" placeholder="Enter your Password" value={registerPassword} onChange={(event)=>{setRegisterPassword(event.target.value)}}/>
                        </div>
                    </div>
                    <button className="register-btn">Register</button>
                </form>

                <div className="have-account-container">
                    <p>Already have an account?</p>
                    <Link id="existing-login-btn" to="/login">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default Register