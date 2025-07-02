import { db } from '../shared/firebase.js';
import {
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('eventoForm');
const tipoSelect = document.getElementById('tipo');
const enviadoPorSelect = document.getElementById('enviadoPorSelect');
const enviadoPorInput = document.getElementById('enviadoPorInput');
const mensaje = document.getElementById('mensajeEnvio');

// Detectar si estamos en modo edición
const urlParams = new URLSearchParams(window.location.search);
const idEvento = urlParams.get("id");

// Cargar tipos y socios
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

// Modo edición: cargar datos existentes
if (idEvento) {
  document.querySelector("h2").textContent = "Editar Evento";
  (async () => {
    const docRef = doc(db, "eventos", idEvento);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const evento = docSnap.data();
      form.titulo.value = evento.titulo || "";
      form.fecha.value = evento.fecha || "";
      form.hora.value = evento.hora || evento.horaInicio || "";
      form.tipo.value = evento.tipo || "";
      form.repetir.value = evento.repetir || "no";
      form.mostrar.value = evento.mostrar || "todos";
      form.comentarios.value = evento.comentarios || "";

      if (socios.includes(evento.enviadoPor)) {
        enviadoPorSelect.value = evento.enviadoPor;
      } else {
        enviadoPorSelect.value = "__otro__";
        enviadoPorInput.style.display = "block";
        enviadoPorInput.value = evento.enviadoPor;
      }

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️ Eliminar evento";
      btnEliminar.type = "button";
      btnEliminar.style.marginTop = "1rem";
      btnEliminar.addEventListener("click", async () => {
        const confirmacion = confirm("¿Seguro que querés eliminar este evento?");
        if (confirmacion) {
          await deleteDoc(docRef);
          alert("Evento eliminado.");
          window.location.href = "/";
        }
      });
      form.appendChild(btnEliminar);
    } else {
      mensaje.textContent = "⚠️ No se encontró el evento para editar.";
      mensaje.style.color = "red";
    }
  })();
}

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
  };

  try {
    if (idEvento) {
      await updateDoc(doc(db, "eventos", idEvento), data);
      mensaje.textContent = "✅ Evento actualizado correctamente.";
    } else {
      await addDoc(collection(db, "eventos"), {
        ...data,
        creadoEn: serverTimestamp()
      });
      mensaje.textContent = "✅ Evento guardado correctamente.";
    }

    mensaje.style.color = "green";
    form.reset();
    enviadoPorInput.style.display = "none";
    enviadoPorInput.value = "";

    if (!idEvento) {
      setTimeout(() => mensaje.textContent = "", 5000);
    }
  } catch (error) {
    console.error("Error al guardar:", error);
    mensaje.textContent = "❌ Error al guardar el evento.";
    mensaje.style.color = "red";
  }
});