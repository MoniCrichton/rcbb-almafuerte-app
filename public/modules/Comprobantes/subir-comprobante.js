
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { app } from "../modules/shared/firebase.js";

const storage = getStorage(app);
const db = getFirestore(app);

window.subirComprobante = async function () {
  const archivo = document.getElementById("archivoInput").files[0];
  const mensaje = document.getElementById("mensaje");

  if (!archivo) {
    mensaje.textContent = "Por favor seleccioná un archivo.";
    return;
  }

  const nombreArchivo = archivo.name;
  const storageRef = ref(storage, "comprobantes/" + nombreArchivo);

  try {
    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "comprobantes"), {
      titulo: nombreArchivo,
      urlArchivo: url,
      tipo: "comprobante",
      enviadoPor: "anónimo",
      fechaSubida: serverTimestamp()
    });

    mensaje.textContent = "¡Gracias! Tu comprobante fue recibido correctamente.";
    document.getElementById("archivoInput").value = "";
  } catch (error) {
    mensaje.textContent = "Error al subir el comprobante.";
    console.error(error);
  }
};

document.getElementById("btnSubir").addEventListener("click", subirComprobante);

