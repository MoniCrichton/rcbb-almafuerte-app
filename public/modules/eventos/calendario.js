import { db } from "../shared/firebase.js";
import { Calendar } from "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js";
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendario");
  const eventos = [];

  const q = query(collection(db, "eventos"), orderBy("fecha", "asc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const e = doc.data();
    const start = e.horaInicio ? `${e.fecha}T${e.horaInicio}` : e.fecha;
    const end = e.horaFin ? `${e.fecha}T${e.horaFin}` : undefined;

    eventos.push({
      title: `${e.titulo}${e.detalles ? ' - ' + e.detalles : ''}`,
      start,
      end,
      extendedProps: {
        tipo: e.tipo,
        mostrar: e.mostrar,
        enviadoPor: e.enviadoPor || '',
      }
    });
  });

  const calendar = new Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
    },
    locale: "es",
    events: eventos,
    eventClick: function (info) {
      const { title, start, end, extendedProps } = info.event;
      const detalle = `\n\n📅 ${start.toLocaleString()}${end ? ` a ${end.toLocaleTimeString()}` : ''}`;
      const mostrar = `👁️ Visible para: ${extendedProps.mostrar}`;
      const autor = extendedProps.enviadoPor ? `📤 Enviado por: ${extendedProps.enviadoPor}` : '';
      alert(`${title}${detalle}\n${mostrar}\n${autor}`);
    },
  });

  calendar.render();
});