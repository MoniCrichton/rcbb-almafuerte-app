// public/eventos/calendario.js
import { db } from '../shared/firebase.js'; // Importa 'db' desde tu archivo de configuración de Firebase

// 🔁 IMPORTS necesarios para Firebase v9+
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

    console.log("Estilos de eventos cargados desde JSON:", eventTypeStyles);
  } catch (error) {
    console.error("Error al cargar estilos desde JSON:", error);
    eventTypeStyles = {
      general: { emoji: "🗓️", color: "#CCCCCC", textColor: "#000000", borderColor: "#CCCCCC" }
    };
  }

  // 🔥 Cargar eventos desde Firebase
  const q = query(collection(db, "eventos"), orderBy("fecha", "asc"));
  const querySnapshot = await getDocs(q);

  function calcularEdad(nacimiento, eventoFecha) {
    if (!nacimiento) return "";
    const d1 = new Date(nacimiento);
    const d2 = new Date(eventoFecha);
    let edad = d2.getFullYear() - d1.getFullYear();
    const m = d2.getMonth() - d1.getMonth();
    if (m < 0 || (m === 0 && d2.getDate() < d1.getDate())) {
      edad--;
    }
    return edad > 0 ? edad : "";
  }

  querySnapshot.forEach((doc) => {
    const e = doc.data();
    console.log("Evento de Firestore:", e);

    const tipoEvento = (e.tipo || 'general').toLowerCase();
    const style = eventTypeStyles[tipoEvento] || eventTypeStyles['general'] || {};

    const emoji = style.emoji || "";
    const color = style.color || "#CCCCCC";
    const textColor = style.textColor || '#000000';
    const borderColor = style.borderColor || '#CCCCCC';

    const esCumpleAniversario = ["cumpleaños", "aniversario"].includes(tipoEvento);
    const edad = (esCumpleAniversario && e.fechaNacimiento) ? calcularEdad(e.fechaNacimiento, e.fecha) : "";
    const title = `${emoji} ${e.titulo}${edad ? ` (${edad})` : ""}`;

    const eventDate =
      typeof e.fecha.toDate === 'function'
        ? e.fecha.toDate().toISOString().split('T')[0]
        : e.fecha;

    const start = e.horaInicio ? `${eventDate}T${e.horaInicio}` : `${eventDate}T00:00:00`;
    const end = e.horaFin ? `${eventDate}T${e.horaFin}` : undefined;

    const displayMode = (esCumpleAniversario && !e.horaInicio && !e.horaFin) ? "list-item" : "auto";

    eventos.push({
      title,
      start,
      end,
      backgroundColor: color,
      textColor: textColor,
      borderColor: borderColor,
      display: displayMode,
      extendedProps: {
        tipo: e.tipo,
        mostrar: e.mostrar,
        enviadoPor: e.enviadoPor || '',
      }
    });
  });

  // 🗓️ Renderizar el calendario
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth"
    },
    locale: "es",
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
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
