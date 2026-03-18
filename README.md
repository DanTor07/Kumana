# Kumana Fintech

> Aplicación móvil de gestión de divisas y portafolio financiero para Latinoamérica.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green)

---

## Vista general

**Kumana Fintech** es una aplicación móvil (React + Capacitor) que permite a los usuarios gestionar billeteras multi-divisa, convertir entre más de 12 monedas, visualizar tendencias de mercado en tiempo real y recibir recomendaciones financieras personalizadas con inteligencia artificial.

Diseñada con un enfoque mobile-first y una interfaz en español, está orientada al mercado latinoamericano.

---

## Capturas de pantalla

> _Agrega aquí imágenes o GIFs de la aplicación._

---

## Funcionalidades principales

| Característica | Descripción |
|---|---|
| **Billetera multi-divisa** | Deposita y administra saldos en 12+ monedas (USD, EUR, COP, MXN, BRL y más) |
| **Conversión de divisas** | Convierte entre cualquier par de monedas con tasas en tiempo real |
| **Gráficos de mercado** | Historial de tasas de cambio con datos reales (Frankfurter API) |
| **Alertas de precio** | Crea alertas personalizadas para pares de divisas y criptomonedas (BTC) |
| **Asesor con IA** | Análisis de portafolio y recomendaciones impulsado por Google Gemini |
| **Historial de inversiones** | Registro completo de conversiones con fecha, hora y tasa aplicada |
| **Perfil de usuario** | Gestión de avatar, datos personales, correo y número de teléfono |
| **Resumen de portafolio** | Balance total del portafolio en la moneda base elegida por el usuario |

---

## Stack tecnológico

### Frontend
- **[React 19](https://react.dev/)** — Biblioteca de UI con hooks
- **[React Router DOM 7](https://reactrouter.com/)** — Enrutamiento del lado del cliente (SPA)
- **[Vite 7](https://vite.dev/)** — Build tool con HMR ultrarrápido
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Estilos utilitarios

### Mobile
- **[Capacitor 8](https://capacitorjs.com/)** — Wrapper nativo React → Android

### APIs externas
- **[Frankfurter API](https://www.frankfurter.app/)** — Datos históricos de tasas (gratuita, sin clave)
- **[Open Exchange Rates (er-api.com)](https://www.exchangerate-api.com/)** — Tasas actuales en vivo
- **[Google Gemini API](https://ai.google.dev/)** — Análisis de portafolio con IA

### Herramientas de desarrollo
- **ESLint 9** — Linting de código
- **npm** — Gestor de paquetes

---

## Estructura del proyecto

```
kumana-app/
├── src/
│   ├── main.jsx                  # Punto de entrada
│   ├── App.jsx                   # Configuración de rutas (9 rutas)
│   ├── index.css                 # Estilos globales + Tailwind
│   ├── context/
│   │   └── FinanceContext.jsx    # Estado global (usuario, billetera, tasas)
│   ├── components/
│   │   └── BottomNav.jsx         # Barra de navegación inferior
│   └── pages/
│       ├── Welcome.jsx           # Pantalla de bienvenida
│       ├── CreateAccount.jsx     # Registro con número de teléfono
│       ├── VerifyNumber.jsx      # Verificación por SMS
│       ├── CompleteProfile.jsx   # Configuración inicial de perfil
│       ├── Dashboard.jsx         # Pantalla principal (balance, gráficos, simulador)
│       ├── Exchange.jsx          # Conversiones, portafolio y asesor IA
│       ├── ConfirmConversion.jsx # Confirmación de conversión
│       ├── RateAlerts.jsx        # Alertas de precios
│       └── Profile.jsx           # Configuración y perfil del usuario
├── android/                      # Proyecto Android nativo (Capacitor)
├── dist/                         # Build de producción
├── public/                       # Assets estáticos
├── capacitor.config.json         # Configuración de Capacitor
├── vite.config.js                # Configuración de Vite
├── eslint.config.js              # Reglas de ESLint
└── index.html                    # HTML de entrada
```

---

## Requisitos previos

- **Node.js** >= 18
- **npm** >= 9
- Para desarrollo Android: **Android Studio** y **JDK 17+**

---

## Instalación y uso

### Desarrollo web

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/kumana-app.git
cd kumana-app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
# Disponible en http://localhost:5173
```

### Build de producción

```bash
npm run build       # Genera el bundle en /dist
npm run preview     # Vista previa local del build
```

### Build y despliegue en Android

```bash
# Construir y sincronizar con Capacitor (abre Android Studio)
npm run android

# Solo sincronizar (sin abrir Android Studio)
npm run sync
```

---

## Variables de entorno

La aplicación utiliza una clave de API de Google Gemini para el módulo de asesoría con IA. Para producción se recomienda moverla a una variable de entorno:

```env
VITE_GEMINI_API_KEY=tu_clave_aqui
```

---

## Diseño y UX

- **Tema oscuro** — Fondo `#0f231d` (verde oscuro), acento primario `#00c28b` (menta)
- **Mobile-first** — Ancho máximo de viewport: 430px
- **Idioma** — Español (locale `es-CO`)
- **Tipografía** — Inter (Google Fonts)
- **Iconos** — Material Symbols Rounded (Google Fonts)
- **Touch-friendly** — Botones con mínimo 44px de área táctil

---

## Estado global y persistencia

El estado de la aplicación se gestiona con React Context (`FinanceContext`) y se persiste automáticamente en `localStorage` bajo la clave `kumana_v1`.

Incluye:
- Perfil del usuario
- Saldos por divisa
- Historial de conversiones
- Tasas de cambio (actualización automática cada 60 s)
- Moneda base del portafolio

---

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Welcome` | Pantalla de bienvenida |
| `/crear-cuenta` | `CreateAccount` | Registro con teléfono |
| `/verificar` | `VerifyNumber` | Verificación SMS |
| `/completar-perfil` | `CompleteProfile` | Configuración de perfil |
| `/dashboard` | `Dashboard` | Pantalla principal |
| `/cambio` | `Exchange` | Portafolio y conversiones |
| `/confirmar` | `ConfirmConversion` | Confirmación de operación |
| `/alertas` | `RateAlerts` | Alertas de precio |
| `/perfil` | `Profile` | Perfil y configuración |

---

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Vista previa del build
npm run lint      # Análisis estático con ESLint
npm run android   # Build + sync + abrir Android Studio
npm run sync      # Build + sync Capacitor
```

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'feat: agrega nueva funcionalidad'`)
4. Sube la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).

---

## Autor

Desarrollado como prototipo funcional de una aplicación fintech para el mercado latinoamericano.
