import { db } from '../shared/firebase.js';

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const lista = document.getElementById('listaEventos');

async function cargarEventos() {
  const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const evento = doc.data();
    const item = document.createElement('li');
    item.textContent = `📅 ${evento.fecha} - ${evento.titulo} (${evento.tipo})`;
    lista.appendChild(item);
  });
}

cargarEventos();
