// public/modules/eventos/cargar-eventos.js

import { db } from "../shared/firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ⚠️ Reemplazá este array con nuevos eventos a cargar
const eventos = [
  // {
  //   titulo: "Ejemplo",
  //   tipo: "tipo",
  //   detalles: "Ubicación",
  //   fecha: "YYYY-MM-DD",
  //   horaInicio: "HH:mm",
  //   horaFin: "HH:mm",
  //   repetir: "semanal" || "mensual" || "no",
  //   hasta: "YYYY-MM-DD", // solo si hay repetición
  //   mostrar: "socios" || "junta",
  //   enviadoPor: "Nombre"
  // }
];

const insertarEventos = async () => {
  for (const evento of eventos) {
    try {
      await addDoc(collection(db, "eventos"), {
        ...evento,
        creadoEn: serverTimestamp()
      });
      console.log(`✅ Evento agregado: ${evento.titulo} - ${evento.fecha}`);
    } catch (error) {
      console.error("❌ Error al agregar evento:", error);
    }
  }
};

insertarEventos();
