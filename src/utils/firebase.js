// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXQa_LSMPsHqFyxcwqaXdFqhzChWiIASw",
  authDomain: "projectt-a35f3.firebaseapp.com",
  projectId: "projectt-a35f3",
  storageBucket: "projectt-a35f3.appspot.com",
  messagingSenderId: "973584858683",
  appId: "1:973584858683:web:4045aebcf2cc209389a61e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =  getAuth(app);
export const googleProvider = new GoogleAuthProvider();

//Database initialization
export const db  = getFirestore(app)