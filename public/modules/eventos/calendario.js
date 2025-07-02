import { db } from '..shared/firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendario');

  const eventos = [];

  const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const e = doc.data();
    eventos.push({
      title: `${e.titulo} ${e.emoji || ''}`,
      start: e.fecha
    });
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    events: eventos
  });

  calendar.render();
});
