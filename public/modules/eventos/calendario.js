// public/eventos/calendario.js
// Importa 'db' desde tu archivo de configuración de Firebase
import { db } from '../shared/config.js';

document.addEventListener("DOMContentLoaded", async function () {
    const calendarEl = document.getElementById("calendario");
    const eventos = [];

    // 🟡 Cargar los estilos por tipo
    // Asegúrate de que esta ruta sea correcta con respecto a calendario.js
    const response = await fetch("../data/event_type_styles.json");
    let typeStyles = await response.json();

    // Transformar typeStyles si es un array a un objeto para fácil acceso
    // Si tu JSON ya es un objeto { "tipo1": {...}, "tipo2": {...} }, puedes omitir esta parte
    if (Array.isArray(typeStyles)) {
        const tempStyles = {};
        typeStyles.forEach(style => {
            if (style.tipo) {
                tempStyles[style.tipo.toLowerCase()] = style;
            }
        });
        typeStyles = tempStyles;
    }


    // 📦 Cargar eventos desde Firebase
    // Usa la instancia 'db' importada
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
        const style = typeStyles[tipoEvento] || typeStyles['general'] || {}; // Fallback a 'general' o vacío

        const emoji = style.emoji || "";
        const color = style.color || "#cccccc"; // Usar el color del JSON
        const textColor = style.textColor || '#000000'; // Nuevo: color del texto del evento
        const borderColor = style.borderColor || '#cccccc'; // Nuevo: color del borde

        const edad = (e.tipo?.toLowerCase() === 'cumpleaños' && e.fechaNacimiento) ? calcularEdad(e.fechaNacimiento, e.fecha) : "";
        const title = `${emoji} ${e.titulo}${edad ? ` (${edad})` : ""}`;

        // ⏱️ Preparar fechas para FullCalendar
        // Si 'fecha' es un string 'YYYY-MM-DD', FullCalendar lo maneja bien.
        // Si tienes timestamps de Firebase, necesitarás .toDate()
        const eventDate = e.fecha instanceof firebase.firestore.Timestamp ? e.fecha.toDate().toISOString().split('T')[0] : e.fecha; // Asegurar YYYY-MM-DD
        
        const start = e.horaInicio ? `${eventDate}T${e.horaInicio}` : `${eventDate}T00:00:00`;
        const end = e.horaFin ? `${eventDate}T${e.horaFin}` : undefined; // No añadir 'T00:00:00' si no hay hora fin explícita

        // ⛔ Evitar mostrar hora en cumpleaños o similares (usar `display: 'list-item'` o `display: 'background'`)
        const displayMode = ["cumpleaños", "aniversario"].includes(tipoEvento) ? "block" : "auto"; // 'block' puede ser problemático, 'auto' o 'list-item' son más estándar

        eventos.push({
            title,
            start,
            end,
            color, // Color de fondo del evento
            textColor, // Color del texto del evento
            borderColor, // Color del borde del evento
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
            right: "dayGridMonth,timeGridWeek,timeGridDay" // Añadir más vistas si es útil
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
            } else {
                detalleFechaHora = `\n\n📅 ${info.event.startStr.split('T')[0]}`; // Solo la fecha si no hay hora
            }

            const mostrar = `👁️ Visible para: ${extendedProps.mostrar || 'todos'}`;
            const autor = extendedProps.enviadoPor ? `📤 Enviado por: ${extendedProps.enviadoPor}` : '';

            alert(`${title}${detalleFechaHora}\n${mostrar}\n${autor}`);
        },
        // Opcional: Permitir interacción con los eventos arrastrándolos/redimensionándolos (para el panel, no para el público)
        // editable: true, 
        // eventDrop: function(info) { /* Actualizar en Firestore */ },
        // eventResize: function(info) { /* Actualizar en Firestore */ }
    });

    calendar.render();
});