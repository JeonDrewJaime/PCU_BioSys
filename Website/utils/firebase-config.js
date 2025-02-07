import { initializeApp } from "firebase/app";
import { getDatabase, ref, set,push } from "firebase/database"; // Import the required Firebase functions

const firebaseConfig = {
  apiKey: "AIzaSyBTPlmlGrLJfKZogE3LqHglGdRui8388bI",
  authDomain: "pcubiosys-50f89.firebaseapp.com",
  databaseURL: "https://pcubiosys-50f89-default-rtdb.firebaseio.com",
  projectId: "pcubiosys-50f89",
  storageBucket: "pcubiosys-50f89.firebasestorage.app",
  messagingSenderId: "771582033960",
  appId: "1:771582033960:web:7251b7b4fecf1286aff51d",
  measurementId: "G-6T91CT52SJ",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Initialize the database

export { app, database, ref, set, push }; // Export the necessary Firebase methods
