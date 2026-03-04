// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4Dti1yL0sqplIO9WrOlxvgll3RbC4n9M",
  authDomain: "cinespin-bd934.firebaseapp.com",
  projectId: "cinespin-bd934",
  storageBucket: "cinespin-bd934.firebasestorage.app",
  messagingSenderId: "148953689345",
  appId: "1:148953689345:web:090e300bb1cc4c2b8fff00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Authentication For This Project
export const auth = getAuth(app);
export const db = getFirestore(app);