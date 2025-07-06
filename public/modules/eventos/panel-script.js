// public/js/panel-script.js
import { db } from '../shared/config.js'; // Importa 'db' desde tu archivo config.js

const form = document.getElementById('form-evento');
const estado = document.getElementById('estado');
const listaEventos = document.getElementById('lista-eventos');
const estadoLista = document.getElementById('estado-lista');

// Función para cargar y mostrar eventos
async function cargarEventos() {
    listaEventos.innerHTML = ''; // Limpiar lista
    estadoLista.textContent = 'Cargando eventos...';
    try {
        const snapshot = await db.collection("eventos").orderBy("fecha", "desc").get(); // Ordenar por fecha para ver los más recientes
        if (snapshot.empty) {
            estadoLista.textContent = 'No hay eventos en Firestore.';
            return;
        }
        snapshot.forEach(doc => {
            const evento = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                ${evento.titulo} (${evento.tipo || 'N/A'}) - ${evento.fecha}
                <button data-id="${doc.id}" class="btn-eliminar">Eliminar</button>
            `;
            listaEventos.appendChild(li);
        });
        estadoLista.textContent = `Eventos cargados: ${snapshot.size}`;
    } catch (err) {
        estadoLista.textContent = '❌ Error al cargar eventos: ' + err.message;
        console.error("Error al cargar eventos:", err);
    }
}

// Escuchador para el formulario de agregar evento
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    // Opcional: Limpiar campos de tiempo si no se usan
    if (!data.horaInicio) delete data.horaInicio;
    if (!data.horaFin) delete data.horaFin;
    if (!data.repetir) delete data.repetir; // No guardar "No" si es vacío

    try {
        await db.collection("eventos").add(data);
        estado.textContent = "✅ Evento agregado correctamente.";
        form.reset();
        await cargarEventos(); // Recargar la lista después de agregar
    } catch (err) {
        estado.textContent = "❌ Error: " + err.message;
        console.error("Error al agregar evento:", err);
    }
});

// Escuchador para eliminar eventos
listaEventos.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-eliminar')) {
        const id = e.target.dataset.id;
        if (confirm('¿Estás seguro de que quieres eliminar este evento?')) {
            try {
                await db.collection("eventos").doc(id).delete();
                estadoLista.textContent = '✅ Evento eliminado correctamente.';
                await cargarEventos(); // Recargar la lista
            } catch (err) {
                estadoLista.textContent = '❌ Error al eliminar: ' + err.message;
                console.error("Error al eliminar evento:", err);
            }
        }
    }
});

// Cargar eventos al cargar la página del panel
document.addEventListener('DOMContentLoaded', cargarEventos);