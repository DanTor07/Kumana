# Kumana Fintech

> Aplicación móvil de gestión de divisas y portafolio financiero para Latinoamérica.

![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9-7F52FF?logo=kotlin&logoColor=white)
![Ktor](https://img.shields.io/badge/Ktor-2.3-FF6B35?logo=ktor&logoColor=white)
![React Navigation](https://img.shields.io/badge/React_Navigation-7-6B52AE?logo=react&logoColor=white)
![License](https://img.shields.io/badge/Licencia-MIT-green)

---

## Vista general

**Kumana Fintech** es una aplicación móvil nativa (React Native + Expo) con un backend en Kotlin (Ktor) que permite a los usuarios gestionar billeteras multi-divisa, convertir entre más de 12 monedas, visualizar tendencias de mercado en tiempo real y recibir recomendaciones financieras personalizadas con inteligencia artificial.

El frontend consume exclusivamente el backend propio (`localhost:8080`), que actúa como capa intermedia hacia las APIs externas. Diseñada con un enfoque mobile-first y una interfaz en español, está orientada al mercado latinoamericano.

---

## Capturas de pantalla

> _Agrega aquí imágenes o GIFs de la aplicación._

---

## Funcionalidades principales

| Característica | Descripción |
|---|---|
| **Billetera multi-divisa** | Deposita y administra saldos en 12+ monedas (USD, EUR, COP, MXN, BRL y más) |
| **Conversión de divisas** | Convierte entre cualquier par de monedas con tasas en tiempo real |
| **Gráficos de mercado** | Historial de tasas de cambio con datos reales (vía backend → Frankfurter API) |
| **Alertas de precio** | Crea alertas personalizadas para pares de divisas con Switch nativo |
| **Asesor con IA** | Análisis de portafolio y recomendaciones impulsado por Google Gemini |
| **Historial de inversiones** | Registro completo de conversiones persistido en el backend |
| **Perfil de usuario** | Gestión de avatar (cámara/galería), datos personales y moneda base |
| **Resumen de portafolio** | Balance total del portafolio en la moneda base elegida por el usuario |

---

## Stack tecnológico

### Mobile (frontend)
- **[React Native 0.81](https://reactnative.dev/)** — Framework de UI nativa
- **[Expo SDK 54](https://expo.dev/)** — Managed Workflow para desarrollo y distribución
- **[React Navigation 7](https://reactnavigation.org/)** — Navegación: NativeStack + BottomTabs
- **[expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** — Gradientes nativos
- **[expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** — Selector de avatar desde cámara o galería
- **[@expo/vector-icons](https://docs.expo.dev/guides/icons/)** — Iconografía (MaterialIcons)
- **[react-native-svg](https://github.com/software-mansion/react-native-svg)** — Gráfico de líneas del mercado
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** — Persistencia local

### Backend
- **[Kotlin 1.9](https://kotlinlang.org/)** — Lenguaje del servidor
- **[Ktor 2.3](https://ktor.io/)** — Framework web (servidor Netty)
- **[kotlinx.serialization](https://github.com/Kotlin/kotlinx.serialization)** — Serialización JSON
- **[Ktor Client (CIO)](https://ktor.io/docs/client-create-and-configure.html)** — Proxy HTTP hacia APIs externas
- **Almacenamiento en memoria** — Billeteras e inversiones sin base de datos (estado en RAM)

### APIs externas (consumidas por el backend)
- **[Frankfurter API](https://www.frankfurter.app/)** — Datos históricos de tasas
- **[Open Exchange Rates (er-api.com)](https://www.exchangerate-api.com/)** — Tasas actuales en vivo
- **[Google Gemini API](https://ai.google.dev/)** — Análisis de portafolio con IA (consumida directamente desde el frontend)

---

## Arquitectura

```
App React Native (Expo)
        ↓ HTTP → 192.168.x.x:8080
Backend Ktor (Kotlin)           ← backend/
  ├── routes/       ← endpoints REST
  ├── controllers/  ← coordinación
  ├── services/     ← lógica de negocio + proxy a APIs externas
  ├── repository/   ← datos en memoria
  └── models/       ← data classes @Serializable
        ↓ proxy
APIs externas (open.er-api.com, frankfurter.app)
```

### Endpoints del backend

| Módulo | Método | Ruta | Descripción |
|---|---|---|---|
| Tasas | GET | `/rates/latest` | Tasas actuales (proxy → er-api.com) |
| Tasas | GET | `/rates/historical?from=&to=&startDate=` | Historial (proxy → frankfurter.app) |
| Auth | POST | `/auth/register` | Registra teléfono |
| Auth | POST | `/auth/verify` | Verifica OTP |
| Auth | POST | `/auth/profile` | Guarda perfil del usuario |
| Billetera | GET | `/wallet/{userId}` | Consulta saldo |
| Billetera | POST | `/wallet/deposit` | Deposita fondos |
| Inversiones | GET | `/investments/{userId}` | Historial de conversiones |
| Inversiones | POST | `/investments/exchange` | Registra una conversión |

### Arquitectura MVC del frontend

```
src/
├── services/          # Modelo — llamadas al backend (api.js + financeService.js)
├── context/           # Estado global (FinanceContext.jsx + AsyncStorage)
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

## Estructura del proyecto

```
kumana/
├── App.jsx                        # Raíz: SafeAreaProvider + FinanceProvider
├── app.json                       # Configuración de Expo
├── index.js                       # Punto de entrada
├── assets/                        # Íconos y splash screen
├── src/
│   ├── context/
│   │   └── FinanceContext.jsx     # Estado global + AsyncStorage + sync con backend
│   ├── hooks/
│   │   ├── useFinanceManager.js   # Lógica de inversiones, tasas e IA
│   │   └── useAuth.js             # Lógica de autenticación
│   ├── services/
│   │   ├── api.js                 # HTTP client base (BASE_URL dinámico)
│   │   └── financeService.js      # Llamadas al backend Ktor
│   ├── navigation/
│   │   ├── AppNavigator.jsx
│   │   ├── AuthStack.jsx
│   │   └── MainTabs.jsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── CreateAccountScreen.jsx
│   │   │   ├── VerifyNumberScreen.jsx
│   │   │   └── CompleteProfileScreen.jsx
│   │   └── main/
│   │       ├── DashboardScreen.jsx
│   │       ├── ExchangeScreen.jsx
│   │       ├── ConfirmConversionScreen.jsx
│   │       ├── RateAlertsScreen.jsx
│   │       └── ProfileScreen.jsx
│   ├── components/
│   │   ├── LineChart.jsx
│   │   └── ChartPicker.jsx
│   ├── styles/
│   │   └── theme.js
│   └── constants/
│       └── currencies.js
└── backend/                       # Servidor Kotlin/Ktor
    ├── build.gradle.kts
    ├── settings.gradle.kts
    ├── gradlew.bat
    └── src/main/kotlin/com/kumana/
        ├── main.kt
        ├── config/
        │   └── Serialization.kt
        ├── models/
        │   ├── User.kt
        │   ├── Wallet.kt
        │   ├── Investment.kt
        │   └── Rate.kt
        ├── repository/
        │   ├── UserRepository.kt
        │   ├── WalletRepository.kt
        │   └── InvestmentRepository.kt
        ├── services/
        │   ├── AuthService.kt
        │   ├── RatesService.kt
        │   ├── WalletService.kt
        │   └── InvestmentService.kt
        ├── controllers/
        │   ├── AuthController.kt
        │   ├── RatesController.kt
        │   ├── WalletController.kt
        │   └── InvestmentController.kt
        └── routes/
            ├── AuthRoutes.kt
            ├── RatesRoutes.kt
            ├── WalletRoutes.kt
            └── InvestmentRoutes.kt
```

---

## Requisitos previos

### Frontend
- **Node.js** >= 18
- **npm** >= 9
- **Expo Go** — app instalada en tu dispositivo ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Backend
- **IntelliJ IDEA** (recomendado) — gestiona JDK y Gradle automáticamente
- O bien **JDK 21** instalado y variable `JAVA_HOME` configurada

---

## Instalación y uso

### 1. Backend (iniciar primero)

**Opción A — IntelliJ IDEA (recomendada):**
1. File → Open → selecciona la carpeta `backend/`
2. Espera que Gradle sincronice las dependencias
3. Abre `main.kt` y haz clic en el ▶ junto a `fun main()`

**Opción B — terminal (requiere JDK 21):**
```bash
cd backend
$env:JAVA_HOME = "ruta\a\tu\jdk"   # PowerShell
.\gradlew.bat run
```

El servidor queda disponible en `http://localhost:8080`.

### 2. Frontend

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

Escanea el QR con **Expo Go** desde tu dispositivo o usa el simulador.

```bash
npm run android   # Emulador Android
npm run ios       # Simulador iOS (requiere macOS)
```

> El frontend detecta automáticamente la IP de la máquina donde corre Expo para conectarse al backend. Ambos deben estar en la misma red.

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

El estado se gestiona con React Context (`FinanceContext`) y se persiste automáticamente en `AsyncStorage` bajo la clave `kumana_v1`. Cada operación de depósito e intercambio se sincroniza además con el backend.

Incluye:
- Perfil del usuario y estado de verificación (`phoneVerified`)
- Saldos por divisa
- Historial de conversiones
- Tasas de cambio (actualización automática cada 60 s desde el backend)
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
npm start         # Inicia Expo Dev Server
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
