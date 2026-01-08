# Mideita - Generador de Ideas Creativas

**Mideita** es una aplicación web que genera ideas creativas combinando animales sudamericanos con caracterizaciones y acciones. Los usuarios pueden guardar, compartir y gestionar sus ideas en una comunidad colaborativa.

## 🎯 Características principales

### Generación de ideas
- **Combinaciones únicas**: Mezcla aleatoria de animales sudamericanos + roles + acciones
- **Regeneración**: Genera nuevas combinaciones sin límite
- **Persistencia**: Guarda ideas para usuarios autenticados y localmente para invitados
- **Restricción 24h**: Usuarios no autenticados pueden generar 1 idea cada 24h

### Gestión de ideas
- **Mi lista**: Visualiza todas tus ideas guardadas
- **Galería personal**: Sube imágenes para tus ideas
- **Eliminar ideas**: Borra ideas individuales o en lote
- **Limpieza automática**: Script para limpiar imágenes huérfanas de Cloudinary

### Comunidad
- **Galería global**: Explora ideas de otros usuarios
- **Perfil público**: Comparte tu galería personal
- **About**: Información sobre la plataforma

## 🛠️ Stack tecnológico

| Aspecto | Tecnología |
|--------|-----------|
| **Frontend** | Vue 3 + TypeScript + Vite |
| **Estilos** | Bootstrap 5 + CSS |
| **Iconos** | FontAwesome 6.5 |
| **Estado** | Pinia |
| **Enrutamiento** | Vue Router |
| **Base de datos** | Firebase Firestore |
| **Autenticación** | Firebase Auth (Google OAuth) |
| **Imágenes** | Cloudinary |

## 📁 Estructura del proyecto
```text
app/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Header.vue        # Navbar responsivo con menú usuario
│   │   ├── Footer.vue        # Footer
│   │   ├── IdeaList.vue      # Listado de ideas con paginación
│   │   └── ...
│   ├── screens/              # Vistas principales
│   │   ├── IdeaGenerator.vue # Pantalla principal
│   │   ├── UserIdeaList.vue  # Mis ideas
│   │   ├── UserGallery.vue   # Mi galería
│   │   ├── GlobalGallery.vue # Galería comunidad
│   │   └── AboutIdeita.vue   # About
│   ├── stores/               # Pinia stores
│   │   ├── authStore.ts      # Autenticación
│   │   ├── ideaStore.ts      # Lógica de ideas
│   │   └── firebase.ts       # Configuración Firebase
│   ├── App.vue               # Componente raíz
│   ├── router.ts             # Rutas
│   └── main.ts               # Entrada
├── scripts/
│   └── cleanupCloudinaryImages.cjs # Script limpieza de imágenes
├── serviceAccountKey.json    # Credenciales Firebase Admin
├── .env.local                # Variables de entorno
└── package.json
```


## 🚀 Instalación

### Requisitos
- Node.js 18+
- npm o yarn
- Cuenta en Firebase
- Cuenta en Cloudinary

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd Mideita/app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea `.env.local` en la carpeta `app`:
```
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

4. **Descargar serviceAccountKey.json**
- Ve a [Firebase Console](https://console.firebase.google.com)
- Project Settings → Service Accounts → Generate New Private Key
- Guarda en `app/serviceAccountKey.json`

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## 📦 Scripts disponibles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Limpiar imágenes huérfanas de Cloudinary
npm run cleanup:images
```

## 🔑 Funcionalidades clave

### Autenticación
- Login con Google OAuth (popup)
- Persistencia de sesión
- Logout
- Fallback a localStorage para usuarios no autenticados

### Firestore (usuarios autenticados)
- Crear, leer, actualizar, eliminar ideas
- Consultas filtradas por usuario
- Ordenamiento por fecha descendente
- Límites: 10 ideas/día, 50 máximo guardadas

### Cloudinary
- Upload unsigned de imágenes
- Tagging automático con `idea_ID`
- Limpieza noctáut de imágenes huérfanas
- Script manual para limpiar imágenes orphaned

### Componentes principales

#### **IdeaGenerator.vue**
- Generación aleatoria de ideas
- Guardado con imagen opcional
- Máquina de estados UI: `initial` → `generated` → `thankYou` → `myIdeas`
- Contador de ideas por día
- Restricción de 24h para usuarios invitados

#### **UserIdeaList.vue**
- Listado de ideas del usuario actual
- Delete individual y eliminación en lote
- Indicadores de imágenes (emoji 🖼️)
- Loading states y manejo de errores

#### **Header.vue**
- Navbar responsive con Bootstrap 5
- Menú usuario con dropdown
- Rutas principales (Home, Comunidad, Mi Galería)
- Login/Logout con confirmación
- Responsive hamburger menu en móvil

#### **IdeaList.vue**
- Componente reutilizable para listas
- Paginación automática
- Checkboxes para selección múltiple
- Indicadores de imágenes
- Botones de acción

## 🔐 Seguridad

### Firebase Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ideas/{ideaId} {
      // Leer: cualquiera puede leer (para galería global)
      allow read: if true;
      
      // Crear: debe estar autenticado y ser el propietario
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId
        && request.resource.data.idea is string
        && request.resource.data.idea.size() >= 5
        && request.resource.data.idea.size() <= 200;
      
      // Actualizar y borrar: solo tus propias ideas
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Cloudinary
- Upload preset sin firma (solo `mideita_upload`)
- API secret solo en backend/local scripts (no expuesto)
- Tagging automático para trazabilidad
- Limpieza automática de recursos huérfanos

## 🧹 Limpieza de imágenes

### Script manual
Cuando borres ideas, ejecuta:
```bash
npm run cleanup:images
```

Esto:
1. Lee todas las ideas activas de Firestore
2. Compara con imágenes en Cloudinary
3. Elimina imágenes cuyas ideas no existen
4. Muestra resumen de operación

### Cloud Function (opcional)
Para limpieza automática diaria, crea una Cloud Function en Firebase que ejecute el mismo lógica a las 2 AM.

## 📊 Análisis del proyecto

### Fortalezas
✅ **Autenticación robusta**: Google OAuth con popup (confiable en desarrollo)
✅ **Sincronización offline**: localStorage → Firestore seamless
✅ **Interfaz responsiva**: Bootstrap 5 + CSS custom
✅ **Manejo de errores**: Try-catch y mensajes claros
✅ **Type safety**: TypeScript en todo el proyecto
✅ **Escalabilidad**: Firestore auto-scale + CDN global
✅ **Limpieza de recursos**: Script para mantener Cloudinary limpio

### Áreas de mejora
⚠️ Validación de imágenes (tamaño máximo, formatos)
⚠️ Paginación en galería global para mejor performance
⚠️ Caché local de ideas para reducir lecturas
⚠️ Analytics para entender patrones de uso
⚠️ Tests automatizados (unit + e2e)
⚠️ Dark mode
⚠️ Internacionalización (i18n)

### Decisiones arquitectónicas

1. **Popup vs Redirect Auth**: Popup elegido para desarrollo (más confiable en localhost, mejor UX)
2. **Dynamic Imports**: Resuelve circular dependencies entre `authStore` e `ideaStore`
3. **localStorage como fallback**: Permite uso offline para invitados
4. **Tagging en Cloudinary**: Permite identificar y limpiar imágenes huérfanas automáticamente

### Flujo de datos
```
generateIdea() → saveIdea() → uploadIdeaWithImage() → myIdeas[]
                                                         ↓
                                                   deleteIdea()
                                                         ↓
                                              image tagged "orphan"
                                                         ↓
                                          cleanup:images script
                                                         ↓
                                          destroy en Cloudinary
```

## 🚢 Deploy

### Firebase Hosting
```bash
# Build para producción
npm run build

# Deploy
firebase deploy
```

### URL de producción (Firebase Hosting)
- Producción: https://mideita.web.app
- Alternativa: https://mideita.firebaseapp.com

Estas URLs corresponden al `PROJECT_ID` configurado en `app/.firebaserc` (`mideita`). Si cambias el proyecto, actualiza `app/.firebaserc` o sustituye el `PROJECT_ID` en estas URLs.

### Cloud Functions (limpieza noctáut)
```bash
firebase deploy --only functions
```

## 🤝 Cómo contribuir

El proyecto está en fase MVP. Sugerencias:
1. 🦙 Agregar más animales sudamericanos
2. 🎭 Expandir caracterizaciones y acciones
3. 🎨 Mejorar diseño UI/UX
4. 🔍 Implementar búsqueda y filtros en galería
5. 📤 Agregar compartir en redes sociales
6. ⭐ Sistema de favoritos/likes

## 📝 Notas técnicas

### Datos de ejemplo
**Animales**: llama, aguará guazú, carpincho, puma, yaguareté...
**Roles**: guerrero medieval, policía, astronauta, superhéroe...
**Acciones**: comprando en supermercado, tocando guitarra, escalando montaña...

### Límites actuales
- 10 ideas/día (usuarios autenticados)
- 50 ideas máximo guardadas
- 1 imagen por idea
- Máximo 25GB almacenamiento Cloudinary (plan gratuito)

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Error de auth en localhost | Agrega `localhost:5173` a dominios autorizados en Firebase |
| Imágenes no cargan | Verifica que `CLOUDINARY_API_KEY` esté en `.env.local` |
| Script cleanup falla | Descarga nuevo `serviceAccountKey.json` en Firebase Console |
| Build falla | Ejecuta `npm install` nuevamente y borra `node_modules` |

## 📄 Licencia

MIT - Libre para usar, modificar y distribuir

---

**Hecho con ❤️ usando Vue 3 + TypeScript + Firebase + Cloudinary**

*Última actualización: Enero 2026*