# 📆 Calendario de Eventos - Rotary Club Bahía Blanca Almafuerte

Este proyecto muestra un calendario de eventos integrado con Firebase y Google Sheets, diseñado para adaptarse a móviles y mostrar información visualmente clara y significativa.

---

## ✅ Funcionalidades

- 🔥 **Carga dinámica de eventos desde Firebase Firestore**
- 🎨 **Colores personalizados por tipo de evento**
- 😊 **Emojis que acompañan el título del evento**
- 🕓 **Visualización clara de la hora de inicio/fin**
- 📱 **Diseño responsive optimizado para dispositivos móviles**
- 🗓 **Vista mensual limpia con botones innecesarios ocultos**

---

## 📁 Estructura del Proyecto

```
/public
  /estilos
    calendario.css         # Estilos visuales del calendario
/modules
  /eventos
    calendario.js          # Script principal que carga y muestra eventos
  /shared
    firebase.js            # Configuración de Firebase
    config.js              # Variables globales de entorno
  /data
    event_type_styles.json # Emojis y colores por tipo de evento
```

---

## 📦 Personalización

El archivo `event_type_styles.json` contiene la relación entre:

- `tipo`: categoría del evento
- `emoji`: icono que lo representa
- `color`: color de fondo del evento en el calendario

Podés editar ese archivo para agregar nuevos tipos o modificar colores y emojis.


![alt text](<imagen calendario.png>)
---

## 🚀 Próximos pasos sugeridos

- [ ] Agregar buscador o filtros por tipo de evento
- [ ] Posibilidad de importar eventos desde Google Sheets automáticamente
- [ ] Exportar eventos a PDF o imprimir



---


**Hecho con 💛 por Monica Crichton para RC Bahía Blanca Almafuerte**