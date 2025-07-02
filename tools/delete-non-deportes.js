// tools/delete-non-deportes.js
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore/lite';

// Configuración de Firebase
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

async function eliminarEventosInnecesarios() {
  const eventosRef = collection(db, 'eventos');
  const snapshot = await getDocs(eventosRef);
  let contador = 0;

  for (const documento of snapshot.docs) {
    const evento = documento.data();
    const id = documento.id;

    const noEsDeportes = (evento.tipo || "").toLowerCase() !== "deportes y valores";
    const esDeLaura = (evento.enviadoPor || "").toLowerCase().includes("laura");

    if (noEsDeportes || esDeLaura) {
      await deleteDoc(doc(db, "eventos", id));
      console.log(`🗑️ Eliminado: "${evento.titulo}" (tipo: ${evento.tipo}, por: ${evento.enviadoPor})`);
      contador++;
    }
  }

  console.log(`\n✅ Total eliminados: ${contador}`);
}

eliminarEventosInnecesarios().catch(console.error);