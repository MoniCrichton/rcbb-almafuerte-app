document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendario");
  const eventos = [];

  const q = firebase.firestore().collection("eventos").orderBy("fecha", "asc");
  const querySnapshot = await q.get();

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

  const calendar = new FullCalendar.Calendar(calendarEl, {
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