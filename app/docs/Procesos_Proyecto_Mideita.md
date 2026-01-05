# Mideita — Documentación de Procesos

Versión: 1.0  
Fecha: 5 de enero de 2026

## Introducción
Este documento describe de forma clara y detallada los procesos funcionales, técnicos y operativos del proyecto Mideita. Su objetivo es facilitar el entendimiento del flujo de trabajo, la arquitectura, las dependencias y los procedimientos de mantenimiento y despliegue.

## Alcance
- Frontend: Vue 3 + TypeScript + Vite.
- Estado global: Pinia stores para autenticación, ideas y configuración de Firebase.
- BaaS: Firebase (Auth, Firestore, posibles reglas y Hosting).
- Medios: Gestión y limpieza de imágenes mediante Cloudinary (script utilitario).

## Diseño del MVP
- Objetivo: validar rápidamente la mecánica de generación de ideas (combinación de elementos) y la interacción básica del usuario antes de invertir en una arquitectura completa.
- Características: interfaz sencilla, generación en cliente, sin backend ni autenticación; enfoque en la experiencia de uso y la viabilidad del concepto.
- Ubicación de recursos del MVP: [bases/diseñomvp](bases/diseñomvp)

## Idea Original
- Prototipo inicial implementado como página estática y script de apoyo:
  - Estructura HTML: [bases/ideaOriginal/blockdeIDEAS.html](bases/ideaOriginal/blockdeIDEAS.html)
  - Lógica JS: [bases/ideaOriginal/scriptsIDEAS.js](bases/ideaOriginal/scriptsIDEAS.js)
- Descripción: generación de combinaciones con JavaScript en el navegador, renderizado directo en el DOM y flujo de interacción básico (botón de generar, visualización inmediata), sin persistencia remota.
- Evolución: este prototipo sentó las bases del flujo actual en Vue/Pinia y la posterior integración con Firebase y Cloudinary.

## Arquitectura
- Punto de entrada y bootstrap: [app/src/main.ts](app/src/main.ts)
- Enrutamiento SPA: [app/src/router.ts](app/src/router.ts)
- Estilos globales: [app/src/style.css](app/src/style.css)
- Componentes UI: [app/src/components](app/src/components)
- Vistas/Pantallas: [app/src/screens](app/src/screens)
- Servicios (referencias/búsqueda de imágenes, utilidades): [app/src/services](app/src/services)
- Estado global (Pinia):
  - Autenticación: [app/src/stores/authStore.ts](app/src/stores/authStore.ts)
  - Ideas: [app/src/stores/ideaStore.ts](app/src/stores/ideaStore.ts)
  - Firebase config: [app/src/stores/firebase.ts](app/src/stores/firebase.ts)
- Script de mantenimiento de imágenes (Cloudinary): [app/scripts/cleanupCloudinaryImages.cjs](app/scripts/cleanupCloudinaryImages.cjs)
- Configuración de hosting Firebase: [firebase.json](firebase.json)
- Configuración y scripts del proyecto frontend: [app/package.json](app/package.json)

## Procesos Funcionales
### Generación de ideas
- El usuario genera combinaciones creativas (p. ej., animal + cualidad + acción) desde la vista principal.
- La aplicación valida la idea (longitud y formato) antes de permitir su guardado.
- Estado UI administrado por la pantalla principal y el store de ideas.

### Guardado de ideas
- Invitados: Las ideas pueden persistirse localmente (p. ej., `localStorage`), con posibles restricciones de frecuencia.
- Autenticados: Las ideas se guardan en Firestore, incluyendo metadatos como usuario y fecha de creación.
- Asociar imagen (opcional): Se guarda la referencia de la imagen (URL) junto a la idea.

### Galerías
- Mis ideas (usuario autenticado): Lista las ideas propias ordenadas por fecha.
- Galería global/comunidad: Lista más recientes de todos los usuarios (límite configurable para rendimiento).

### Referencias e Imágenes
- Búsqueda/selección de referencias visuales mediante el servicio de imágenes: [app/src/services/imageService.ts](app/src/services/imageService.ts).
- Subida y asociación: El flujo de subida enlaza la imagen con la idea del usuario.

## Flujos Clave
1. Generar idea → Validar → Guardar (local/Firestore) → Visualizar en galería correspondiente.
2. Subir imagen → Obtener URL → Actualizar idea con referencia visual.
3. Eliminar idea → Quitar de Firestore/local → (opcional) marcar imagen para limpieza por script.

## Límites y Reglas
- Reglas de negocio para frecuencia de generación/guardado y cantidad máxima por usuario (configurables en el store de ideas: [app/src/stores/ideaStore.ts](app/src/stores/ideaStore.ts)).
- Validaciones de contenido: longitud mínima/máxima y unicidad básica.

## Seguridad
- Autenticación con proveedor de Google (Popup/OAuth) administrada por el store de autenticación: [app/src/stores/authStore.ts](app/src/stores/authStore.ts).
- Firestore: Mantener reglas para lectura controlada y escritura por propietario. Evitar exponer información sensible.
- Cloudinary: Usar presets configurados, mantener secretos fuera del cliente. El script de limpieza debe ejecutarse en entorno seguro: [app/scripts/cleanupCloudinaryImages.cjs](app/scripts/cleanupCloudinaryImages.cjs).

## Operación y Mantenimiento
- Carga de "Mis ideas": Consultas por `userId`, ordenadas descendentemente.
- Carga de galería global: Últimas N entradas para rendimiento.
- Eliminación de ideas: Quitar documento y (si corresponde) desasociar imagen.
- Limpieza de imágenes huérfanas: Ejecutar el script de utilidades para eliminar en Cloudinary imágenes sin idea activa.

## Entorno y Deploy
- Variables de entorno (Cloudinary, Firebase): mantener en archivos `.env` locales (no subir a repositorio).
- Firebase config y credenciales del cliente: [app/src/stores/firebase.ts](app/src/stores/firebase.ts).
- Build y preview: gestionados por Vite (ver scripts en [app/package.json](app/package.json)).
- Hosting: Deploy con Firebase Hosting, SPA rewrites según [firebase.json](firebase.json).

## Procedimientos Paso a Paso
### Generar y guardar idea
1. Abrir la pantalla principal.
2. Generar idea y verificar restricciones.
3. Guardar en `localStorage` (invitado) o en Firestore (autenticado).
4. Visualizar en "Mis ideas" o en la galería global.

### Subir imagen y asociarla a una idea
1. Seleccionar idea en "Mis ideas".
2. Subir imagen (cliente/servicio).
3. Guardar URL/metadata y asociar a la idea.

### Eliminar idea
1. Seleccionar idea en "Mis ideas".
2. Confirmar eliminación.
3. Borrar de Firestore/local y marcar para limpieza de imagen si aplica.

### Limpieza manual de imágenes huérfanas
1. Ejecutar el script de utilidades de Cloudinary: [app/scripts/cleanupCloudinaryImages.cjs](app/scripts/cleanupCloudinaryImages.cjs).
2. Verificar que las imágenes eliminadas no tengan referencia en Firestore.

## Troubleshooting
- Autenticación en desarrollo: Autorizar `http://localhost:5173` en consola de Firebase.
- Fallo de subida de imágenes: Revisar llaves/presets y CORS.
- Errores de lectura/escritura Firestore: Comprobar reglas, índices y permisos del usuario.
- Problemas de build: Reinstalar dependencias, limpiar `node_modules`, revisar configuración de Vite.

## Referencias
- Entrada app: [app/src/main.ts](app/src/main.ts)
- Router: [app/src/router.ts](app/src/router.ts)
- Stores: [app/src/stores](app/src/stores)
- Servicios de imágenes: [app/src/services/imageService.ts](app/src/services/imageService.ts)
- Script de limpieza: [app/scripts/cleanupCloudinaryImages.cjs](app/scripts/cleanupCloudinaryImages.cjs)
- Hosting y deploy: [firebase.json](firebase.json), [app/package.json](app/package.json)

## Glosario
- "Idea": Unidad de contenido generada por el usuario.
- "Galería": Vista que lista ideas (propias o globales).
- "Huérfana": Imagen sin referencia a una idea activa.

## Control de cambios
- 1.0 (2026-01-05): Primera versión del documento con descripción de arquitectura, procesos, flujos, seguridad y mantenimiento.