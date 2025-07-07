import { db } from '../shared/config.js';
import { collection, getDocs, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { eventos as nuevosEventos } from '../data/eventos_generados.js';

async function cargarEventosDesdeArchivo() {
  const col = collection(db, "eventos");
  const snapshot = await getDocs(col);

  const eventosExistentes = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    eventosExistentes.push({ id: doc.id, ...data });
  });

  let subidos = 0;
  let actualizados = 0;

  for (const evento of nuevosEventos) {
    const match = eventosExistentes.find(ev =>
      ev.fecha === evento.fecha && ev.titulo === evento.titulo
    );

    if (!match) {
      // Evento nuevo → subir
      const nuevoRef = doc(col);
      await setDoc(nuevoRef, {
        ...evento,
        creadoEn: new Date()
      });
      subidos++;
    } else if (match.mostrar === "todos") {
      // Evento ya existe pero tiene "todos" → actualizar a "socios"
      const ref = doc(db, "eventos", match.id);
      await updateDoc(ref, { mostrar: "socios" });
      actualizados++;
    }
  }

  alert(`✅ Subidos: ${subidos}, Actualizados: ${actualizados}`);
}

export { cargarEventosDesdeArchivo };
