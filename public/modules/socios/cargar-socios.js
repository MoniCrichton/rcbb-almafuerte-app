import { db } from '../shared/firebase.js';
// Cargar lista de socios
fetch("https://opensheet.vercel.app/ID_DE_TU_HOJA/Socios")
  .then(res => res.json())
  .then(data => {
    const select = document.getElementById('enviadoPor');
    if (!select) return;

    const socios = data.map(row => `${row.Nombre} ${row.Apellido}`);
    socios.sort((a, b) => a.localeCompare(b, 'es'));

    socios.forEach(nombreCompleto => {
      const option = document.createElement('option');
      option.value = nombreCompleto;
      option.textContent = nombreCompleto;
      select.appendChild(option);
    });
  });
