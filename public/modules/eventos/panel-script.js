// public/js/panel-script.js
import { db } from '../shared/config.js'; // Importa 'db' desde tu archivo config.js

const formEvento = document.getElementById('form-evento');
const estadoEvento = document.getElementById('estado-evento');

// Escuchador para el formulario de agregar evento
formEvento.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formEvento).entries());

    // Limpiar campos de tiempo si no se usan
    if (!data.horaInicio) delete data.horaInicio;
    if (!data.horaFin) delete data.horaFin;
    if (!data.repetir) delete data.repetir;
    if (!data.fechaNacimiento) delete data.fechaNacimiento; // Eliminar si no se llena

    try {
        await db.collection("eventos").add(data);
        estadoEvento.textContent = "✅ Evento agregado correctamente.";
        formEvento.reset();
    } catch (err) {
        estadoEvento.textContent = "❌ Error: " + err.message;
        console.error("Error al agregar evento:", err);
    }
});

// Nota: No se necesitan funciones de cargar/eliminar eventos o tipos de eventos por ahora en el panel.