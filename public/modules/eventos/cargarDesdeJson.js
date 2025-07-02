// public/modules/eventos/cargar-eventos.js
import { db } from "../shared/firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Cargar eventos desde JSON externo
const jsonURL = "./modules/eventos/eventos_nuevos.json";

async function insertarEventos() {
  try {
    const response = await fetch(jsonURL);
    const eventos = await response.json();

    for (const evento of eventos) {
      await addDoc(collection(db, "eventos"), {
        ...evento,
        creadoEn: serverTimestamp()
      });
      console.log(`✅ Evento agregado: ${evento.titulo} - ${evento.fecha}`);
    }

    alert("✅ Todos los eventos fueron cargados con éxito.");
  } catch (error) {
    console.error("❌ Error al agregar evento:", error);
    alert("❌ Hubo un error al cargar los eventos.");
  }
}

insertarEventos();
