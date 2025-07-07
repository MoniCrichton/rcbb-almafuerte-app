import { db } from '../shared/firebase.js';
import {
  collection,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendario");
  const eventos = [];
  let eventTypeStyles = {};

  // 🔍 Detectar si estamos en modo "junta"
  const params = new URLSearchParams(window.location.search);
  const esModoJunta = params.get("modo") === "junta";
  console.log("👁️ Modo junta activado:", esModoJunta);

  // 🟡 Cargar estilos desde JSON local
  try {
    const response = await fetch("../data/event_type_styles.json");
    const jsonStyles = await response.json();
    jsonStyles.forEach(style => {
      if (style.tipo) {
        eventTypeStyles[style.tipo.toLowerCase()] = style;
      }
    });
    if (!eventTypeStyles['general']) {
      eventTypeStyles['general'] = {
        emoji: "🗓️",
        color: "#CCCCCC",
        textColor: "#000000",
        borderColor: "#CCCCCC"
      };
    }
  } catch (error) {
    console.error("Error al cargar estilos desde JSON:", error);
    eventTypeStyles = {
      general: { emoji: "🗓️", color: "#CCCCCC", textColor: "#000000", borderColor: "#CCCCCC" }
    };
  }

  const q = query(collection(db, "eventos"), orderBy("fecha", "asc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const e = doc.data();
    const tipoEvento = (e.tipo || 'general').trim().toLowerCase();
    const style = eventTypeStyles[tipoEvento] || eventTypeStyles['general'] || {};

    // 🔐 Filtro por visibilidad
    if (!esModoJunta && e.mostrar === "junta") return;

    const emoji = style.emoji || "";
    const color = style.color || "#CCCCCC";
    const textColor = style.textColor || '#000000';
    const borderColor = style.borderColor || '#CCCCCC';

    const eventDate =
      typeof e.fecha.toDate === 'function'
        ? e.fecha.toDate().toISOString().split('T')[0]
        : e.fecha;

    const start = e.horaInicio ? `${eventDate}T${e.horaInicio}` : `${eventDate}T00:00:00`;
    const end = e.horaFin ? `${eventDate}T${e.horaFin}` : undefined;

    const tipoClase = "evento-" + tipoEvento.replace(/\s+/g, '-');

    eventos.push({
      title: `${emoji} ${e.titulo}`,
      start,
      end,
      classNames: [tipoClase],
      extendedProps: {
        tipo: e.tipo,
        mostrar: e.mostrar,
        enviadoPor: e.enviadoPor || '',
      }
    });
  });

  const initialView = window.innerWidth < 768 ? "listMonth" : "dayGridMonth";

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView,
    dayMaxEventRows: true,
    locale: "es",
    events: eventos,
    eventClick: function (info) {
      const { title, start, end, extendedProps } = info.event;
      let detalleFechaHora = '';
      if (start) {
        const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        if (end) {
          const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          detalleFechaHora = `\n\n🕓 ${startTime} a ${endTime}`;
        } else {
          detalleFechaHora = `\n\n🕓 ${startTime}`;
        }
      } else if (info.event.startStr) {
        detalleFechaHora = `\n\n📅 ${info.event.startStr.split('T')[0]}`;
      }

      const mostrar = `👁️ Visible para: ${extendedProps.mostrar || 'todos'}`;
      const autor = extendedProps.enviadoPor ? `📤 Enviado por: ${extendedProps.enviadoPor}` : '';

      alert(`${title}${detalleFechaHora}\n${mostrar}\n${autor}`);
    }
  });

  calendar.render();
});
