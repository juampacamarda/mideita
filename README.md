# 🎨 Mideita

**Generador de Ideas Creativas para Dibujar**

Proyecto final del Bootcamp Frontend Moderno - Una aplicación web que ayuda a artistas y dibujantes a ejercitar su creatividad generando ideas únicas y divertidas para dibujar.

## 🎯 Concepto

Mideita combina aleatoriamente:
- **Animales sudamericanos** (llama, carpincho, yaguareté, etc.)
- **Caracterizaciones** (guerrero medieval, científico, chef, etc.)
- **Acciones/contextos** (comprando en el supermercado, escalando una montaña, etc.)

Para crear prompts creativos como: *"Un carpincho vestido de astronauta tocando la guitarra"*

## 🚀 Tecnologías

- **Vue 3** - Framework progresivo
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Pinia** - State management
- **Bootstrap 5** - UI/Estilos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/Mideita.git
cd Mideita/app

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🎮 Funcionalidades

✅ Generador de ideas aleatorias únicas  
✅ Sistema de guardado en localStorage  
✅ Límite de 1 idea por día (24 horas)  
✅ Historial de últimas 7 ideas guardadas  
✅ Timer hasta próxima idea disponible  
✅ Lista colapsable de ideas guardadas  

## 📂 Estructura del Proyecto

```
app/
├── src/
│   ├── components/
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   └── IdeaGenerator.vue
│   ├── stores/
│   │   └── IdeaStore.ts
│   ├── App.vue
│   └── main.ts
├── public/
└── package.json
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

## 🎨 Estados de la Aplicación

1. **Inicial** - Botón "Generar idea"
2. **Idea generada** - Muestra idea + botones Descartar/Elegir
3. **Gracias** - Mensaje de confirmación al guardar
4. **Mis ideas** - Historial de últimas 7 ideas
5. **Esperando** - Lista colapsable + countdown para próxima idea

## 📝 Roadmap

- [ ] Modal de referencias visuales
- [ ] Upload de bocetos
- [ ] Autenticación de usuarios
- [ ] Galería pública de bocetos
- [ ] Sistema de categorías personalizadas

## 👤 Autor

**@JuampaCamarda**

---

*Proyecto desarrollado como trabajo final del Bootcamp Frontend Moderno*