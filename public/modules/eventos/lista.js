import { db } from "../shared/firebase.js";

const contenedor = document.getElementById("eventos");
const filtroInput = document.getElementById("filtro-texto");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroVisibilidad = document.getElementById("filtro-visibilidad");
const limpiarBtn = document.getElementById("btn-limpiar");

let eventosOriginales = [];

function calcularEdad(nacimiento, eventoFecha) {
  if (!nacimiento) return "";
  const d1 = new Date(nacimiento);
  const d2 = new Date(eventoFecha);
  let edad = d2.getFullYear() - d1.getFullYear();
  const m = d2.getMonth() - d1.getMonth();
  if (m < 0 || (m === 0 && d2.getDate() < d1.getDate())) edad--;
  return edad > 0 ? ` (${edad})` : "";
}

function renderizarLista(eventos) {
  if (eventos.length === 0) {
    contenedor.innerHTML = "<p>No hay eventos para mostrar.</p>";
    return;
  }

  const secciones = {};
  eventos.forEach((e) => {
    const fecha = new Date(typeof e.fecha.toDate === "function" ? e.fecha.toDate() : e.fecha);
    const fechaStr = fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    if (!secciones[fechaStr]) secciones[fechaStr] = [];

    const hora = e.horaInicio ? `🕓 ${e.horaInicio}` : "";
    const emoji = e.emoji || "";
    const edad = ["cumpleaños", "aniversario"].includes(e.tipo?.toLowerCase()) ? calcularEdad(e.fechaNacimiento, fecha) : "";

    secciones[fechaStr].push(`<div class="evento"><strong>${emoji} ${e.titulo}${edad}</strong><br>${hora}</div>`);
  });

  contenedor.innerHTML = Object.entries(secciones)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(
      ([fecha, eventos]) =>
        `<div class="evento-dia">
          <h3>📅 ${fecha.charAt(0).toUpperCase() + fecha.slice(1)}</h3>
          ${eventos.join("\n")}
        </div>`
    )
    .join("\n");
}

function filtrarEventos() {
  const texto = filtroInput?.value?.toLowerCase() || "";
  const tipo = filtroTipo?.value || "";
  const visibilidad = filtroVisibilidad?.value || "";

  const filtrados = eventosOriginales.filter((e) => {
    const coincideTexto = e.titulo?.toLowerCase().includes(texto);
    const coincideTipo = tipo === "" || e.tipo === tipo;

    let coincideVisibilidad = true;
    if (visibilidad === "general") coincideVisibilidad = e.mostrar === "general";
    else if (visibilidad === "socios") coincideVisibilidad = ["socios", "general"].includes(e.mostrar);
    else if (visibilidad === "junta") coincideVisibilidad = true; // muestra todo

    return coincideTexto && coincideTipo && coincideVisibilidad;
  });

  renderizarLista(filtrados);
}

function obtenerParametroUrl(nombre) {
  const params = new URLSearchParams(window.location.search);
  return params.get(nombre);
}

async function cargarEventos() {
  const q = db.collection("eventos").orderBy("fecha", "asc");
  const querySnapshot = await q.get();
  eventosOriginales = querySnapshot.docs.map((doc) => doc.data());

  const tiposUnicos = [...new Set(eventosOriginales.map(e => e.tipo).filter(Boolean))].sort();
  filtroTipo.innerHTML = '<option value="">Todos los tipos</option>' + tiposUnicos.map(t => `<option value="${t}">${t}</option>`).join("");

  const visibilidadURL = obtenerParametroUrl("ver");
  if (visibilidadURL) {
    filtroVisibilidad.value = visibilidadURL;
  }

  filtrarEventos();
}

document.addEventListener("DOMContentLoaded", cargarEventos);
filtroInput?.addEventListener("input", filtrarEventos);
filtroTipo?.addEventListener("change", filtrarEventos);
filtroVisibilidad?.addEventListener("change", filtrarEventos);
limpiarBtn?.addEventListener("click", () => {
  filtroInput.value = "";
  filtroTipo.value = "";
  filtroVisibilidad.value = "";
  filtrarEventos();
});
