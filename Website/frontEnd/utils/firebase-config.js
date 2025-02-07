// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTPlmlGrLJfKZogE3LqHglGdRui8388bI",
  authDomain: "pcubiosys-50f89.firebaseapp.com",
  databaseURL: "https://pcubiosys-50f89-default-rtdb.firebaseio.com",
  projectId: "pcubiosys-50f89",
  storageBucket: "pcubiosys-50f89.firebasestorage.app",
  messagingSenderId: "771582033960",
  appId: "1:771582033960:web:7251b7b4fecf1286aff51d",
  measurementId: "G-6T91CT52SJ"
};


export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);