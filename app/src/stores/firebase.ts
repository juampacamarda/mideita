import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPf3ilUXboBygXRC_2tDg18EbwJURarBY",
  authDomain: "mideita.firebaseapp.com",
  projectId: "mideita",
  storageBucket: "mideita.firebasestorage.app",
  messagingSenderId: "669758002720",
  appId: "1:669758002720:web:2eeb0ab8daf24094a48e45"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);