import { db } from '../shared/firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('eventoForm');
const tipoSelect = document.getElementById('tipo');
const enviadoPorSelect = document.getElementById('enviadoPorSelect');
const enviadoPorInput = document.getElementById('enviadoPorInput');
const mensaje = document.getElementById('mensajeEnvio');

const tipos = [
  { tipo: "Reunión", emoji: "📅" },
  { tipo: "Cena", emoji: "🍽️" },
  { tipo: "Bingo", emoji: "🎫" },
  { tipo: "Aniversario", emoji: "🎉" }
];

const socios = [
  "Moni Crichton", "Juan Pérez", "Laura Gómez", "Carlos Díaz"
];

tipos.forEach(({ tipo, emoji }) => {
  const option = document.createElement("option");
  option.value = tipo;
  option.textContent = `${emoji} ${tipo}`;
  tipoSelect.appendChild(option);
});

socios.forEach(nombre => {
  const option = document.createElement("option");
  option.value = nombre;
  option.textContent = nombre;
  enviadoPorSelect.appendChild(option);
});

const otro = document.createElement("option");
otro.value = "__otro__";
otro.textContent = "Otra persona...";
enviadoPorSelect.appendChild(otro);

enviadoPorSelect.addEventListener("change", () => {
  enviadoPorInput.style.display = enviadoPorSelect.value === "__otro__" ? "block" : "none";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mensaje.textContent = "⏳ Enviando...";
  mensaje.style.color = "black";

  const enviadoPor = enviadoPorSelect.value === "__otro__"
    ? enviadoPorInput.value.trim()
    : enviadoPorSelect.value;

  if (!enviadoPor) {
    mensaje.textContent = "❌ Por favor completá quién envía el evento.";
    mensaje.style.color = "red";
    return;
  }

  const data = {
    titulo: form.titulo.value.trim(),
    fecha: form.fecha.value,
    hora: form.hora.value,
    tipo: form.tipo.value,
    repetir: form.repetir.value,
    mostrar: form.mostrar.value,
    enviadoPor,
    comentarios: form.comentarios.value.trim(),
    creadoEn: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "eventos"), data);
    mensaje.textContent = "✅ Evento guardado correctamente.";
    mensaje.style.color = "green";
    form.reset();
    enviadoPorInput.style.display = "none";
    enviadoPorInput.value = "";
  } catch (error) {
    console.error("Error al guardar:", error);
    mensaje.textContent = "❌ Error al guardar el evento.";
    mensaje.style.color = "red";
  }

  setTimeout(() => mensaje.textContent = "", 5000);
});
