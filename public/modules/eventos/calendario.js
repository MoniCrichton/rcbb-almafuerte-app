document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendario");
  const eventos = [];

  // Cargar los estilos por tipo
  const response = await fetch("../data/event_type_styles.json");
  const typeStyles = await response.json();

  const db = firebase.default.firestore();
  const q = db.collection("eventos").orderBy("fecha", "asc");
  const querySnapshot = await q.get();

  querySnapshot.forEach((doc) => {
    const e = doc.data();
    console.log("Evento:", e);  // 👈 agregá esto
    const start = e.horaInicio ? `${e.fecha}T${e.horaInicio}` : e.fecha;
    const end = e.horaFin ? `${e.fecha}T${e.horaFin}` : undefined;

    const style = typeStyles.find(s => s.tipo.toLowerCase() === e.tipo?.toLowerCase());
    const emoji = style?.emoji || "";
    const color = style?.color || "#cccccc";

    eventos.push({
      title: `${emoji} ${e.titulo}`,
      start,
      end,
      color,
      extendedProps: {
        tipo: e.tipo,
        mostrar: e.mostrar,
        enviadoPor: e.enviadoPor || '',
      }
    });
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title"
    },

    locale: "es",
    events: eventos,
    eventClick: function (info) {
      const { title, start, end, extendedProps } = info.event;
      const detalle = `\n\n🕓 ${start.toLocaleString()}${end ? ` a ${end.toLocaleTimeString()}` : ''}`;
      const mostrar = `👁️ Visible para: ${extendedProps.mostrar}`;
      const autor = extendedProps.enviadoPor ? `📤 Enviado por: ${extendedProps.enviadoPor}` : '';
      alert(`${title}${detalle}\n${mostrar}\n${autor}`);
    },
  });

  calendar.render();
});