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
    const [registerEmailError, setRegisterEmailError] = useState(false)
    const [registerPassword, setRegisterPassword] = useState("")
    const [registerPasswordError, setRegisterPasswordError] = useState(false)
    const [regErrorMessage, setErrorMessage] = useState("")
    const [hiddenRegErrorMessage, setHiddenRegErrorMessage] = useState(true)
    const [firstname, setFirstname] = useState("")
    const [firstnameInputError, setFirstnameInputError] = useState(false)
    const [lastname, setLastname] = useState("");
    const [lastnameInputError, setLastnameInputError] = useState(false)

    const createUser = async (event) =>{
        event.preventDefault()

        let containError = false;

        // Validate Input
        if (!firstname.trim()){
            containError = true;
        }

        !firstname.trim()? setFirstnameInputError(true) : setFirstnameInputError(false)

        if (!lastname.trim()){
            containError = true;
        }

        !lastname.trim()? setLastnameInputError(true) : setLastnameInputError(false)
        
        if (!registerEmail.trim()){
            containError = true;
        }

        !registerEmail.trim()? setRegisterEmailError(true) : setRegisterEmailError(false)

        if (!registerPassword.trim()){
            containError = true;
        }

        !registerPassword.trim()? setRegisterPasswordError(true) : setRegisterPasswordError(false)

        if(containError){
            containError = false;
            setErrorMessage("Please fill out all empty fields")
            setHiddenRegErrorMessage(false)
            return
        }

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
                username: `${firstname} ${lastname}`,
                email: user.email,
             })

            //  Reset Error Message and navigate to the home page
            setFirstnameInputError(false)
            setLastnameInputError(false)
            setRegisterEmailError(false)
            setRegisterPasswordError(false)
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

                <form className="register-form" onSubmit={createUser} noValidate>
                    <div className="user-first-last-outercontainer">

                        <div className="firstname-container">

                            <label htmlFor="firstname-input">First Name</label>
                            <input id="firstname-input" className={firstnameInputError? "error-input" : ""} type="text" placeholder="First Name" value={firstname} onChange={(event) => {setFirstname(event.target.value)}} required/>

                        </div>

                        <div className="lastname-container">

                            <label htmlFor="lastname-input">Last Name</label>
                            <input id="lastname-input" className={lastnameInputError? "error-input" : ""} type="text" placeholder="Last Name" value={lastname} onChange={(event) => {setLastname(event.target.value)}}required/>

                        </div>

                    </div>

                    <div className="register-email-outercontainer">

                        <label htmlFor="register-input">Email</label>
                        <div className="register-email-container">
                            <FaEnvelope className="email-input-icon" />
                            <input id="register-input" className={registerEmailError? "error-input" : ""} type="email" placeholder="Enter your email. Ex: youremail@domain.com" value={registerEmail} onChange={(event)=>{setRegisterEmail(event.target.value)}} required/>
                        </div>

                    </div>

                    <div className="register-password-outercontainer">

                        <label htmlFor="reg-password-input">Password</label>
                        <div className="register-password-container">
                            <FaLock className="password-input-icon" />
                            <input id="reg-password-input" className={registerPasswordError? "error-input" : ""} type="password" placeholder="Enter your Password" value={registerPassword} onChange={(event)=>{setRegisterPassword(event.target.value)}}required/>
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