// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import{getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyABFI04irEU_w2JY0xcSV9QK0pBUeYpcBs",
    authDomain: "focusflow-52752.firebaseapp.com",
    projectId: "focusflow-52752",
    storageBucket: "focusflow-52752.firebasestorage.app",
    messagingSenderId: "630842581052",
    appId: "1:630842581052:web:428cf15e46529075792339",
    measurementId: "G-D13QB6M5TE"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
//export
export {auth,db}