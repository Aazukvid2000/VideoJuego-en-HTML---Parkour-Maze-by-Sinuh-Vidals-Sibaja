# Parkour Maze - Sistema de Música y Leaderboard

## 📁 Estructura del Proyecto

```
Jueguito/
│
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── Game.js
│   ├── main.js
│   ├── LevelManager.js
│   ├── ParticleSystem.js
│   └── SpecialEffects.js
└── audios/
    └── background-music.mp3  ← CREAR ESTA CARPETA Y ARCHIVO
```

## 🎵 Cómo Agregar Música de Fondo

### Paso 1: Crear la carpeta `audios`
En la raíz de tu proyecto (al mismo nivel que `index.html`), crea una carpeta llamada **`audios`**

### Paso 2: Agregar el archivo de música
1. Descarga o elige una música de fondo en formato `.mp3`
2. Renombra el archivo a: **`background-music.mp3`**
3. Coloca el archivo dentro de la carpeta `audios/`

### Resultado esperado:
```
Jueguito/
└── audios/
    └── background-music.mp3  ✅
```

### Dónde conseguir música gratuita:
- **Pixabay Music**: https://pixabay.com/music/
- **Free Music Archive**: https://freemusicarchive.org/
- **Incompetech**: https://incompetech.com/music/
- **YouTube Audio Library**: https://studio.youtube.com/

**IMPORTANTE**: Asegúrate de que la música sea libre de derechos o tengas los permisos para usarla.

## 🎮 Controles del Juego

### Durante el juego:
- **←/→ o A/D**: Mover izquierda/derecha
- **Espacio o ↑ o W**: Saltar

### Controles de música:
- **Botón "🔇 Música: OFF"**: Activa/desactiva la música de fondo
  - Se encuentra en el panel del leaderboard

## 🏆 Sistema de Leaderboard

### Características:
- ✅ **Score siempre inicia en 0** cuando empiezas el juego
- ✅ Guarda los **Top 5 mejores puntajes**
- ✅ Pide **username** al completar el nivel 3
- ✅ Muestra **medallas** para los 3 primeros lugares
- ✅ Datos guardados en **LocalStorage** (persisten al cerrar el navegador)

### Cómo funciona:
1. Juega los 3 niveles
2. Al completar el nivel 3, aparecerá una pantalla para ingresar tu nombre
3. Ingresa tu username y haz clic en "Guardar Score"
4. Tu puntaje aparecerá en el Top 5 si es suficientemente alto

### Sistema de puntos:
- **Recolectable**: +100 puntos
- **Completar nivel**: +500 puntos base
- **Bonus por tiempo**: +10 puntos por cada segundo sobrante (máx 180 segundos)

## 🔧 Solución de Problemas

### La música no suena:
1. Verifica que el archivo esté en `audios/background-music.mp3`
2. Revisa que el formato sea `.mp3`
3. Algunos navegadores bloquean la reproducción automática - haz clic en el botón de música
4. Abre la consola del navegador (F12) para ver si hay errores

### El score no guarda en 0:
- El código está configurado para que el score **SIEMPRE inicie en 0**
- Si ves un valor diferente, verifica que estés usando los archivos actualizados

### El leaderboard no funciona:
- Asegúrate de que tu navegador tenga LocalStorage habilitado
- Prueba en modo incógnito si hay problemas
- Verifica que hayas completado los 3 niveles

## 📝 Notas Importantes

1. **No se necesita servidor**: El juego funciona abriendo directamente `index.html`
2. **LocalStorage**: Los datos se guardan localmente en tu navegador
3. **Música opcional**: El juego funciona perfectamente sin música, pero mejora la experiencia

## 🎨 Personalización

### Cambiar la música:
- Reemplaza `audios/background-music.mp3` con tu archivo preferido
- Mantén el mismo nombre o edita la línea 24 de `SpecialEffects.js`:
  ```javascript
  this.backgroundMusic = new Audio('audios/TU-NOMBRE-ARCHIVO.mp3');
  ```

### Ajustar volumen:
En `SpecialEffects.js`, línea 12:
```javascript
this.musicVolume = 0.3;  // Valor entre 0.0 (silencio) y 1.0 (máximo)
```

¡Disfruta jugando Parkour Maze! 🎮🎉