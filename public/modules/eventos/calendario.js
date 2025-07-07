// public/eventos/calendario.js
import { db } from '../shared/config.js'; // Importa 'db' desde tu archivo de configuración de Firebase

document.addEventListener("DOMContentLoaded", async function () {
    const calendarEl = document.getElementById("calendario");
    const eventos = [];
    let eventTypeStyles = {}; // Objeto para almacenar los estilos por tipo (del JSON)

    // 🟡 Cargar los estilos por tipo DESDE EL JSON local (como lo tenías)
    try {
        // Asegúrate de que esta ruta sea correcta con respecto a calendario.js
        const response = await fetch("../data/event_type_styles.json");
        const jsonStyles = await response.json();

        // Transformar el array del JSON a un objeto para fácil acceso
        jsonStyles.forEach(style => {
            if (style.tipo) {
                eventTypeStyles[style.tipo.toLowerCase()] = style;
            }
        });

        // Asegúrate de tener un tipo 'general' por defecto si no existe en el JSON
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
        console.error("Error al cargar estilos de tipos de evento desde JSON:", error);
        // Fallback a estilos por defecto si hay un error
        eventTypeStyles = {
            general: { emoji: "🗓️", color: "#CCCCCC", textColor: "#000000", borderColor: "#CCCCCC" }
        };
    }

    // 📦 Cargar eventos desde Firebase
    const q = db.collection("eventos").orderBy("fecha", "asc");
    const querySnapshot = await q.get();

    // 🎂 Función para calcular edad (mantener si tienes fechas de nacimiento)
    function calcularEdad(nacimiento, eventoFecha) {
        if (!nacimiento) return "";
        const d1 = new Date(nacimiento); // Fecha de nacimiento
        const d2 = new Date(eventoFecha); // Fecha del evento (para calcular la edad en ese momento)
        let edad = d2.getFullYear() - d1.getFullYear();
        const m = d2.getMonth() - d1.getMonth();
        if (m < 0 || (m === 0 && d2.getDate() < d1.getDate())) {
            edad--;
        }
        return edad > 0 ? edad : ""; // Solo mostrar edad si es positiva
    }

    querySnapshot.forEach((doc) => {
        const e = doc.data();
        console.log("Evento de Firestore:", e);

        // Obtener estilos basados en el tipo de evento
        const tipoEvento = (e.tipo || 'general').toLowerCase(); // Default 'general'
        const style = eventTypeStyles[tipoEvento] || eventTypeStyles['general'] || {}; // Fallback a 'general' o el default que pusimos

        const emoji = style.emoji || "";
        const color = style.color || "#CCCCCC"; // Color de fondo del evento
        // Si tu JSON no tiene textColor/borderColor, se usará el default del JS
        const textColor = style.textColor || '#000000';
        const borderColor = style.borderColor || '#CCCCCC';

        // Asegúrate de que 'e.fechaNacimiento' exista y el tipo sea 'cumpleaños' o 'aniversario' para calcular la edad
        const esCumpleAniversario = ["cumpleaños", "aniversario"].includes(tipoEvento);
        const edad = (esCumpleAniversario && e.fechaNacimiento) ? calcularEdad(e.fechaNacimiento, e.fecha) : "";
        const title = `${emoji} ${e.titulo}${edad ? ` (${edad})` : ""}`;

        // ⏱️ Preparar fechas para FullCalendar
        // Si 'fecha' es un string 'YYYY-MM-DD', FullCalendar lo maneja bien.
        // Si tienes timestamps de Firebase, necesitarás .toDate()
        const eventDate =
            typeof e.fecha.toDate === 'function'
                ? e.fecha.toDate().toISOString().split('T')[0]
                : e.fecha;

        
        const start = e.horaInicio ? `${eventDate}T${e.horaInicio}` : `${eventDate}T00:00:00`;
        const end = e.horaFin ? `${eventDate}T${e.horaFin}` : undefined;

        // display de FullCalendar
        // 'list-item' es una buena opción para eventos de día completo en vistas de lista.
        // En month view, 'auto' o 'block' si quieres que ocupen todo el día.
        const displayMode = (esCumpleAniversario && !e.horaInicio && !e.horaFin) ? "list-item" : "auto"; // Ejemplo: si es cumple y no tiene hora, lo muestra como item de lista

        eventos.push({
            title,
            start,
            end,
            backgroundColor: color, // FullCalendar usa 'backgroundColor'
            textColor: textColor,   // FullCalendar usa 'textColor'
            borderColor: borderColor, // FullCalendar usa 'borderColor'
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
            right: "dayGridMonth" // Mantener solo dayGridMonth o añadir vistas que sean responsivas
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
            } else if (info.event.startStr) { // Si solo hay fecha, FullCalendar puede tener startStr
                detalleFechaHora = `\n\n📅 ${info.event.startStr.split('T')[0]}`;
            }

            const mostrar = `👁️ Visible para: ${extendedProps.mostrar || 'todos'}`;
            const autor = extendedProps.enviadoPor ? `📤 Enviado por: ${extendedProps.enviadoPor}` : '';

            alert(`${title}${detalleFechaHora}\n${mostrar}\n${autor}`);
        },
        // Opcional: para el diseño móvil, considera estos ajustes en tu CSS
        // No hay propiedades directas de FullCalendar para "dos días por línea",
        // eso se controla con el CSS y el grid de tu HTML del calendario.
    });

    calendar.render();
});