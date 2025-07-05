document.addEventListener("DOMContentLoaded", async function () {
  const calendarEl = document.getElementById("calendario");
  const eventos = [];

  // 🟡 Cargar los estilos por tipo
  const response = await fetch("../data/event_type_styles.json");
  const typeStyles = await response.json();

  const db = firebase.default.firestore();
  const q = db.collection("eventos").orderBy("fecha", "asc");
  const querySnapshot = await q.get();

  // 🎂 Función para calcular edad
  function calcularEdad(nacimiento, evento) {
    if (!nacimiento) return "";
    const d1 = new Date(nacimiento);
    const d2 = new Date(evento);
    let edad = d2.getFullYear() - d1.getFullYear();
    const m = d2.getMonth() - d1.getMonth();
    if (m < 0 || (m === 0 && d2.getDate() < d1.getDate())) edad--;
    return edad;
  }

  // 📦 Cargar eventos desde Firebase
  querySnapshot.forEach((doc) => {
    const e = doc.data();
    console.log("Evento:", e);

    const style = typeStyles.find(s => s.tipo.toLowerCase() === e.tipo?.toLowerCase());
    const emoji = style?.emoji || "";
    const color = style?.color || "#cccccc";
    const edad = calcularEdad(e.fechaNacimiento, e.fecha);
    const title = `${emoji} ${e.titulo}${edad ? ` (${edad})` : ""}`;

    // ⏱️ Preparar fechas
    const start = e.horaInicio ? `${e.fecha}T${e.horaInicio}` : `${e.fecha}T00:00`;
    const end = e.horaFin ? `${e.fecha}T${e.horaFin}` : undefined;

    // ⛔ Evitar mostrar hora en cumpleaños o similares
    const display = ["cumpleaños", "aniversario"].includes((e.tipo || "").toLowerCase()) ? "block" : "auto";

    eventos.push({
      title,
      start,
      end,
      color,
      display,
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
      center: "title"
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
      const detalle = `\n\n🕓 ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${end ? ` a ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`;
      const mostrar = `👁️ Visible para: ${extendedProps.mostrar}`;
      const autor = extendedProps.enviadoPor ? `📤 Enviado por: ${extendedProps.enviadoPor}` : '';
      alert(`${title}${detalle}\n${mostrar}\n${autor}`);
    },
  });

  calendar.render();
});
