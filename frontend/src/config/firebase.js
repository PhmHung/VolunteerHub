// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVa4S9W0NVnwXiK4rtDtP5v22p_PJtiTo",
  authDomain: "japaneselearning-adceb.firebaseapp.com",
  projectId: "japaneselearning-adceb",
  storageBucket: "japaneselearning-adceb.firebasestorage.app",
  messagingSenderId: "366099462553",
  appId: "1:366099462553:web:fde7f5152deac93c1cfb08",
  measurementId: "G-83XNP8H6ZN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();