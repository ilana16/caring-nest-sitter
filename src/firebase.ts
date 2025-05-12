// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC18Waetsnb5BUM-UnSVCJzasiUC-uAreo",
  authDomain: "ilana-cares-now.firebaseapp.com",
  databaseURL: "https://ilana-cares-now-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ilana-cares-now",
  storageBucket: "ilana-cares-now.firebasestorage.app",
  messagingSenderId: "11455775009",
  appId: "1:11455775009:web:afb8e3407f59b19a8dbe60",
  measurementId: "G-069XVH4K9V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

