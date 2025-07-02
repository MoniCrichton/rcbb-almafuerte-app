// tools/exportarEventos.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "eventos-exportados.json");

const firebaseConfig = {
  apiKey: "AIzaSyDGbWOmA28Lb0aoe0HIXeOYZ6lHH4rTNLk",
  authDomain: "calendario-rcbba.firebaseapp.com",
  projectId: "calendario-rcbba",
  storageBucket: "calendario-rcbba.firebasestorage.app",
  messagingSenderId: "874861663623",
  appId: "1:874861663623:web:2c24b216123a876b4d2f22"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

(async () => {
  const eventosRef = collection(db, "eventos");
  const q = query(eventosRef, orderBy("fecha", "asc"));
  const snapshot = await getDocs(q);

  const eventos = [];
  snapshot.forEach(doc => {
    eventos.push({ id: doc.id, ...doc.data() });
  });

  fs.writeFileSync(outputPath, JSON.stringify(eventos, null, 2), "utf-8");
  console.log(`✅ Exportados ${eventos.length} eventos a eventos-exportados.json`);
})();