import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyDGbWOmA28Lb0aoe0HIXeOYZ6lHH4rTNLk",

  authDomain: "calendario-rcbba.firebaseapp.com",

  projectId: "calendario-rcbba",

  storageBucket: "calendario-rcbba.firebasestorage.app",

  messagingSenderId: "874861663623",

  appId: "1:874861663623:web:2c24b216123a876b4d2f22"

};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
