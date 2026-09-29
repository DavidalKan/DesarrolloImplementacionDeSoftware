// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "backend-firebase-52e19.firebaseapp.com",
  projectId: "backend-firebase-52e19",
  storageBucket: "backend-firebase-52e19.firebasestorage.app",
  messagingSenderId: "143978169099",
  appId: "1:143978169099:web:5838f94ecf1ae7fe4d580e",
  measurementId: "G-CF8HY15BJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}
