# Kumana Fintech

> Aplicación móvil de gestión de divisas y portafolio financiero para Latinoamérica.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![React Navigation](https://img.shields.io/badge/React_Navigation-7-6B52AE?logo=react&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green)

---

## Vista general

**Kumana Fintech** es una aplicación móvil nativa (React Native + Expo) que permite a los usuarios gestionar billeteras multi-divisa, convertir entre más de 12 monedas, visualizar tendencias de mercado en tiempo real y recibir recomendaciones financieras personalizadas con inteligencia artificial.

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
| **Alertas de precio** | Crea alertas personalizadas para pares de divisas con Switch nativo |
| **Asesor con IA** | Análisis de portafolio y recomendaciones impulsado por Google Gemini |
| **Historial de inversiones** | Registro completo de conversiones con fecha, hora y tasa aplicada |
| **Perfil de usuario** | Gestión de avatar (cámara/galería), datos personales y moneda base |
| **Resumen de portafolio** | Balance total del portafolio en la moneda base elegida por el usuario |

---

## Stack tecnológico

### Mobile
- **[React Native 0.81](https://reactnative.dev/)** — Framework de UI nativa
- **[Expo SDK 54](https://expo.dev/)** — Managed Workflow para desarrollo y distribución
- **[React Navigation 7](https://reactnavigation.org/)** — Navegación: NativeStack + BottomTabs
- **[expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** — Gradientes nativos
- **[expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** — Selector de avatar desde cámara o galería
- **[@expo/vector-icons](https://docs.expo.dev/guides/icons/)** — Iconografía (MaterialIcons)
- **[react-native-svg](https://github.com/software-mansion/react-native-svg)** — Gráfico de líneas del mercado
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** — Persistencia local

### APIs externas
- **[Frankfurter API](https://www.frankfurter.app/)** — Datos históricos de tasas (gratuita, sin clave)
- **[Open Exchange Rates (er-api.com)](https://www.exchangerate-api.com/)** — Tasas actuales en vivo
- **[Google Gemini API](https://ai.google.dev/)** — Análisis de portafolio con IA

---

## Arquitectura MVC

El proyecto sigue una arquitectura **Modelo — Vista — Controlador**:

```
src/
├── services/          # Modelo — llamadas a APIs externas
│   └── financeService.js
├── context/           # Estado global
│   └── FinanceContext.jsx
├── hooks/             # Controlador — lógica de negocio
│   ├── useFinanceManager.js
│   └── useAuth.js
├── screens/           # Vista — pantallas de la app
│   ├── auth/
│   └── main/
├── components/        # Componentes reutilizables
├── navigation/        # Configuración de navegación
├── styles/            # Tema y tokens de diseño
└── constants/         # Monedas y formateadores
```

---

## Estructura completa del proyecto

```
kumana/
├── App.jsx                        # Raíz: SafeAreaProvider + FinanceProvider
├── app.json                       # Configuración de Expo
├── index.js                       # Punto de entrada
├── assets/                        # Íconos y splash screen
└── src/
    ├── context/
    │   └── FinanceContext.jsx     # Estado global + AsyncStorage
    ├── hooks/
    │   ├── useFinanceManager.js   # Lógica de inversiones, tasas e IA
    │   └── useAuth.js             # Lógica de autenticación
    ├── services/
    │   └── financeService.js      # Frankfurter API + er-api.com
    ├── navigation/
    │   ├── AppNavigator.jsx       # Decide entre AuthStack / MainTabs
    │   ├── AuthStack.jsx          # Flujo de registro e inicio de sesión
    │   └── MainTabs.jsx           # Tabs principales + DashboardStack
    ├── screens/
    │   ├── auth/
    │   │   ├── WelcomeScreen.jsx
    │   │   ├── CreateAccountScreen.jsx
    │   │   ├── VerifyNumberScreen.jsx
    │   │   └── CompleteProfileScreen.jsx
    │   └── main/
    │       ├── DashboardScreen.jsx
    │       ├── ExchangeScreen.jsx
    │       ├── ConfirmConversionScreen.jsx
    │       ├── RateAlertsScreen.jsx
    │       └── ProfileScreen.jsx
    ├── components/
    │   ├── LineChart.jsx          # Gráfico SVG de tendencia
    │   └── ChartPicker.jsx        # Selector de divisa (Modal + FlatList)
    ├── styles/
    │   └── theme.js               # COLORS, SPACING, RADIUS
    └── constants/
        └── currencies.js          # Definición de 12+ monedas
```

---

## Requisitos previos

- **Node.js** >= 18
- **npm** >= 9
- **Expo Go** — app instalada en tu dispositivo ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

---

## Instalación y uso

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/kumana.git
cd kumana

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

Escanea el QR con **Expo Go** desde tu dispositivo.

### Ejecutar en plataforma específica

```bash
npm run android   # Abre en emulador o dispositivo Android
npm run ios       # Abre en simulador iOS (requiere macOS)
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_GEMINI_API_KEY=tu_clave_aqui
```

> La clave se obtiene en [Google AI Studio](https://aistudio.google.com/). Sin ella, el módulo de asesor IA muestra un mensaje informativo y el resto de la app funciona con normalidad.

---

## Diseño y UX

- **Tema oscuro** — Fondo `#0f231d` (verde oscuro), acento primario `#00c28b` (menta)
- **Idioma** — Español (locale `es-CO`)
- **Iconos** — MaterialIcons vía `@expo/vector-icons`
- **Touch-friendly** — `TouchableOpacity` en todos los elementos interactivos
- **Estilos** — `StyleSheet.create()` con tokens centralizados en `theme.js`

---

## Estado global y persistencia

El estado se gestiona con React Context (`FinanceContext`) y se persiste automáticamente en `AsyncStorage` bajo la clave `kumana_v1`.

Incluye:
- Perfil del usuario y estado de verificación (`phoneVerified`)
- Saldos por divisa
- Historial de conversiones
- Tasas de cambio (actualización automática cada 60 s)
- Moneda base del portafolio

---

## Navegación

### Flujo de autenticación (`AuthStack`)
| Pantalla | Descripción |
|---|---|
| `WelcomeScreen` | Bienvenida con opción de registrarse o iniciar sesión |
| `CreateAccountScreen` | Ingreso de número de teléfono (máx. 10 dígitos) |
| `VerifyNumberScreen` | Verificación OTP con teclado numérico personalizado |
| `CompleteProfileScreen` | Configuración inicial del perfil (solo en registro) |

### Tabs principales (`MainTabs`)
| Tab | Pantalla | Descripción |
|---|---|---|
| Inicio | `DashboardScreen` | Balance, gráfico de mercado y simulador |
| Cambio | `ExchangeScreen` | Portafolio, depósitos, conversiones y asesor IA |
| Alertas | `RateAlertsScreen` | Alertas de precio con Switch nativo |
| Perfil | `ProfileScreen` | Datos personales, avatar y moneda base |

---

## Scripts disponibles

```bash
npm start         # Inicia Expo Dev Server (escanea con Expo Go)
npm run android   # Inicia en Android
npm run ios       # Inicia en iOS
npm run web       # Inicia en navegador web
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
