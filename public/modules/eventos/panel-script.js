import { db } from '../modules/shared/firebase.js';
import {
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("form-evento").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    data.fecha = Timestamp.fromDate(new Date(data.fecha));
    if (data.fechaNacimiento) {
      data.fechaNacimiento = new Date(data.fechaNacimiento).toISOString().split("T")[0];
    }
    if (data.horaInicio === "") delete data.horaInicio;
    if (data.horaFin === "") delete data.horaFin;
    if (data.fechaNacimiento === "") delete data.fechaNacimiento;

    data.creadoEn = new Date();
    await addDoc(collection(db, "eventos"), data);

    document.getElementById("estado-evento").textContent = "✅ Evento cargado con éxito.";
    form.reset();
  } catch (error) {
    console.error("Error al guardar evento:", error);
    document.getElementById("estado-evento").textContent = "❌ Error al guardar el evento.";
  }
});
