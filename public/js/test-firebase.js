import { db } from './firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Vamos a agregar un evento de prueba
async function agregarEventoDePrueba() {
  try {
    const docRef = await addDoc(collection(db, "eventos"), {
      titulo: "Evento de prueba",
      fecha: "2025-07-01",
      tipo: "Reunión",
      emoji: "📅",
      creadoEn: serverTimestamp()
    });
    console.log("Documento creado con ID:", docRef.id);
    alert("¡Evento guardado correctamente!");
  } catch (e) {
    console.error("Error al agregar evento:", e);
    alert("Error al guardar");
  }
}

agregarEventoDePrueba();
