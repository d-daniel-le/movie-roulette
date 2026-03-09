import { createContext, useEffect, useState } from "react"
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();  

function AuthProvider({children}){
    const [user, setUser] = useState(null)
    
    // Check if the user has been logged in
    useEffect(() =>{
        const stopListening = onAuthStateChanged(auth, (user) => {
          setUser(user)
        })
    
        return () => stopListening();
    }, [])
    
    return(
        // Allows userinfo  accessible throughout the app
        <AuthContext.Provider value={{user}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider