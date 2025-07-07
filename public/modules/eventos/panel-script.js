// public/js/panel-script.js
// La ruta es '../shared/config.js' porque panel-script.js está en 'public/js/'
// y 'config.js' está en 'public/shared/'
import { db } from '../shared/config.js';

const formEvento = document.getElementById('form-evento');
const estadoEvento = document.getElementById('estado-evento');

formEvento.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formEvento).entries());

    if (!data.horaInicio) delete data.horaInicio;
    if (!data.horaFin) delete data.horaFin;
    if (!data.repetir) delete data.repetir;
    if (!data.fechaNacimiento) delete data.fechaNacimiento;

    try {
        await db.collection("eventos").add(data);
        estadoEvento.textContent = "✅ Evento agregado correctamente.";
        formEvento.reset();
    } catch (err) {
        estadoEvento.textContent = "❌ Error: " + err.message;
        console.error("Error al agregar evento:", err);
    }
});