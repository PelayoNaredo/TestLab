# TestLab - Arquitectura Modular

## Estructura de Archivos JavaScript

La aplicación TestLab ha sido refactorizada en múltiples módulos especializados para mejorar la mantenibilidad y separación de responsabilidades.

### 📁 Estructura de Módulos

```
js/
├── utils.js              # Utilidades y funciones auxiliares
├── screen-manager.js     # Manejo de animaciones y transiciones
├── timer-manager.js      # Lógica del temporizador continuo
├── question-manager.js   # Gestión de preguntas y respuestas
├── navigation-manager.js # Navegación y grid de estado
└── app.js               # Clase principal coordinadora
```

### 🔧 Descripción de Módulos

#### `utils.js`

**Responsabilidades:**

- Funciones de utilidad general
- Aleatorización de arrays (`shuffleArray`)
- Formateo de tiempo (`formatTime`)
- Manipulación de DOM (`createElement`)
- Funciones de debounce y helpers

#### `screen-manager.js`

**Responsabilidades:**

- Transiciones entre pantallas con animaciones
- Creación y manejo de partículas de fondo
- Animaciones escalonadas de elementos
- Reset de animaciones

#### `timer-manager.js`

**Responsabilidades:**

- Temporizador continuo del test
- Pausa/reanudación del timer
- Formateo y display del tiempo transcurrido
- Control de visibilidad del temporizador

#### `question-manager.js`

**Responsabilidades:**

- Estado y lógica de preguntas
- Aleatorización consistente de respuestas
- Selección y validación de respuestas
- Feedback visual de respuestas
- Estadísticas del test

#### `navigation-manager.js`

**Responsabilidades:**

- Grid de estado de preguntas (3 círculos)
- Navegación entre preguntas
- Actualización de botones de navegación
- Estados visuales (correcta/incorrecta/visitada)

#### `app.js`

**Responsabilidades:**

- Coordinación de todos los módulos
- Carga de datos de materias
- Flujo principal de la aplicación
- Event listeners globales

### 🎯 Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**: Cada módulo tiene una función específica y bien definida
2. **Mantenibilidad**: Fácil localizar y modificar funcionalidad específica
3. **Reutilización**: Los módulos pueden ser reutilizados en otros contextos
4. **Testabilidad**: Cada módulo puede ser probado independientemente
5. **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar otros módulos

### 🔄 Flujo de Datos

```
app.js (Coordinador)
    ↓
┌─── screen-manager.js (Transiciones)
├─── timer-manager.js (Tiempo)
├─── question-manager.js (Preguntas)
│        ↓
└─── navigation-manager.js (Navegación)
    ↓
utils.js (Utilidades)
```

### 🚀 Cómo Extender la Aplicación

Para agregar nueva funcionalidad:

1. **Nueva funcionalidad de UI**: Extender `screen-manager.js`
2. **Nueva lógica de preguntas**: Extender `question-manager.js`
3. **Nuevos tipos de navegación**: Extender `navigation-manager.js`
4. **Nuevas utilidades**: Agregar a `utils.js`
5. **Nueva funcionalidad principal**: Modificar `app.js`

### 📝 Convenciones de Código

- Cada módulo exporta su clase principal a `window`
- Los métodos públicos están documentados
- Los métodos privados (internos) usan prefijo `_` (convención)
- Cada módulo maneja su propio estado interno
- La comunicación entre módulos se hace a través de callbacks o referencias

### 🔧 Mantenimiento

Para debugging o modificaciones:

- Utilizar las herramientas de desarrollo del navegador
- Cada módulo puede ser inspeccionado independientemente
- Los logs están organizados por módulo
- Los errores se propagan correctamente hasta `app.js`
