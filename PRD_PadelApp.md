# PRD — App de Pádel Profesional
**Versión:** 1.0  
**Fecha:** Abril 2026  
**Equipo:** 2 desarrolladores  
**Stack:** React Native (iOS + Android)  
**API de datos:** padelapi.org  

---

## Índice

1. [Visión general](#1-visión-general)
2. [Objetivos del producto](#2-objetivos-del-producto)
3. [Usuarios y contexto](#3-usuarios-y-contexto)
4. [Modelo de monetización](#4-modelo-de-monetización)
5. [Arquitectura técnica](#5-arquitectura-técnica)
6. [Estructura de archivos](#6-estructura-de-archivos)
7. [Navegación](#7-navegación)
8. [Pantallas y flujos](#8-pantallas-y-flujos)
9. [Features detalladas](#9-features-detalladas)
10. [API y datos](#10-api-y-datos)
11. [Autenticación y usuarios](#11-autenticación-y-usuarios)
12. [Notificaciones push](#12-notificaciones-push)
13. [Diseño y theming](#13-diseño-y-theming)
14. [Estado global](#14-estado-global)
15. [Roadmap y fases](#15-roadmap-y-fases)
16. [Presupuesto](#16-presupuesto)
17. [División de trabajo](#17-división-de-trabajo)

---

## 1. Visión general

App móvil nativa (iOS + Android) para fans del pádel profesional. Permite seguir en tiempo real los partidos del circuito Premier Padel y FIP, con estadísticas detalladas, rankings actualizados, perfiles de jugadores favoritos y notificaciones instantáneas.

**Competidor principal:** BePadel (bepadel.es)  
**Ventaja competitiva:**
- UI/UX superior con dark/light mode
- Estadísticas más ricas y visuales
- Sistema de jugadores favoritos con alertas inteligentes
- Modelo Freemium + Ads bien ejecutado

---

## 2. Objetivos del producto

| Objetivo | Métrica de éxito |
|---|---|
| Lanzamiento MVP en menos de 3 meses | App publicada en App Store y Google Play |
| Superar a BePadel en retención | DAU/MAU > 40% |
| Monetización sostenible | 60+ usuarios premium para cubrir costes |
| Experiencia en directo fluida | Latencia marcador < 3 segundos |

---

## 3. Usuarios y contexto

**Usuario principal:** Fan del pádel profesional, 20-45 años, España. Sigue el circuito Premier Padel, conoce a los jugadores top, quiere estar al día sin tener que buscar en múltiples sitios.

**Jobs to be done:**
- "Quiero saber el marcador de un partido ahora mismo sin abrir YouTube"
- "Quiero que me avisen cuando empiece el partido de mi jugador favorito"
- "Quiero ver las estadísticas de un partido que no pude ver en directo"
- "Quiero saber en qué posición está mi jugador favorito en el ranking"

---

## 4. Modelo de monetización

### Plan Gratuito
- Marcador en directo (actualización cada 30s)
- Rankings generales
- Resultados de torneos pasados
- Máximo 2 jugadores favoritos
- Anuncios AdMob (banner inferior + interstitial entre secciones)

### Plan Premium — 2,99€/mes o 19,99€/año
- Marcador en directo vía WebSocket (tiempo real)
- Estadísticas detalladas punto por punto
- Jugadores favoritos ilimitados
- Notificaciones instantáneas
- Widget en pantalla de inicio
- Sin anuncios
- Historial completo de partidos

### Implementación
- **iOS:** StoreKit 2 (In-App Purchase)
- **Android:** Google Play Billing
- Librería: `react-native-iap`
- Validación de recibos en backend propio

---

## 5. Arquitectura técnica

```
┌─────────────────────────────────────────┐
│           React Native App               │
│  iOS + Android                           │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Backend Propio  │
        │  (Node.js)       │
        │  Railway / Fly.io│
        └───┬─────────┬───┘
            │         │
   ┌────────▼──┐  ┌───▼──────────┐
   │ padelapi  │  │  Supabase     │
   │  .org     │  │  (PostgreSQL) │
   │  REST +   │  │  Auth + DB    │
   │  WS       │  └──────────────┘
   └───────────┘
            │
   ┌────────▼──────────┐
   │  Firebase Cloud   │
   │  Messaging (FCM)  │
   │  Notificaciones   │
   └───────────────────┘
```

### Stack detallado

| Capa | Tecnología | Motivo |
|---|---|---|
| App | React Native 0.74+ | iOS + Android en un codebase |
| Navegación | React Navigation 6 | Estándar de la industria |
| Estado global | Zustand | Ligero, sin boilerplate |
| Queries/Cache | TanStack Query (React Query) | Cache, refetch, loading states |
| WebSocket | Socket.io-client | Marcadores en tiempo real |
| Auth | Supabase Auth | Email, Google, Apple Sign In |
| Base de datos usuarios | Supabase PostgreSQL | Favoritos, preferencias, suscripción |
| Backend API | Node.js + Express | Proxy de padelapi.org + lógica de negocio |
| Hosting backend | Railway | Simple, barato, escalable |
| Notificaciones | Firebase + react-native-notifications | Push multiplataforma |
| Pagos | react-native-iap | StoreKit 2 + Google Play Billing |
| Anuncios | react-native-google-mobile-ads | AdMob |
| Estilos | StyleSheet + custom theme system | Sin dependencias innecesarias |
| Iconos | react-native-vector-icons | |
| Animaciones | react-native-reanimated 3 | Animaciones fluidas 60fps |
| Almacenamiento local | MMKV | Más rápido que AsyncStorage |

---

## 6. Estructura de archivos

```
/
├── src/
│   ├── api/                          # Capa de acceso a datos
│   │   ├── client.ts                 # Axios instance + interceptors
│   │   ├── endpoints.ts              # Constantes de URLs
│   │   ├── websocket.ts              # Configuración WebSocket
│   │   ├── matches.api.ts            # Llamadas de partidos
│   │   ├── players.api.ts            # Llamadas de jugadores
│   │   ├── rankings.api.ts           # Llamadas de rankings
│   │   └── tournaments.api.ts        # Llamadas de torneos
│   │
│   ├── components/                   # Componentes reutilizables
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Avatar.tsx
│   │   ├── matches/
│   │   │   ├── MatchCard.tsx         # Tarjeta de partido en lista
│   │   │   ├── LiveScoreBoard.tsx    # Marcador en directo
│   │   │   ├── SetScore.tsx          # Marcador por sets
│   │   │   ├── MatchStats.tsx        # Stats del partido
│   │   │   └── PointByPoint.tsx      # Historial punto a punto
│   │   ├── players/
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PlayerAvatar.tsx
│   │   │   └── FavoriteButton.tsx
│   │   ├── rankings/
│   │   │   ├── RankingRow.tsx
│   │   │   └── RankingFilters.tsx
│   │   ├── tournaments/
│   │   │   ├── TournamentCard.tsx
│   │   │   └── DrawBracket.tsx
│   │   └── ads/
│   │       ├── BannerAd.tsx
│   │       └── InterstitialAd.tsx
│   │
│   ├── screens/                      # Pantallas de la app
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── matches/
│   │   │   ├── MatchesScreen.tsx     # Lista de partidos
│   │   │   └── MatchDetailScreen.tsx # Detalle + stats
│   │   ├── rankings/
│   │   │   └── RankingsScreen.tsx
│   │   ├── tournaments/
│   │   │   ├── TournamentsScreen.tsx
│   │   │   └── TournamentDetailScreen.tsx
│   │   ├── players/
│   │   │   ├── PlayersScreen.tsx
│   │   │   └── PlayerDetailScreen.tsx
│   │   ├── favorites/
│   │   │   └── FavoritesScreen.tsx
│   │   └── settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── PremiumScreen.tsx
│   │       └── NotificationsSettingsScreen.tsx
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx         # Navegador raíz (auth vs app)
│   │   ├── AuthNavigator.tsx         # Stack de autenticación
│   │   ├── AppNavigator.tsx          # Tab navigator principal
│   │   ├── MatchesNavigator.tsx      # Stack dentro de Partidos
│   │   ├── TournamentsNavigator.tsx  # Stack dentro de Torneos
│   │   └── types.ts                  # Tipos de params de navegación
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useLiveMatch.ts           # WebSocket de partido en directo
│   │   ├── useFavorites.ts
│   │   ├── usePremium.ts
│   │   ├── useTheme.ts
│   │   └── useNotifications.ts
│   │
│   ├── store/                        # Zustand stores
│   │   ├── authStore.ts
│   │   ├── favoritesStore.ts
│   │   ├── themeStore.ts
│   │   └── premiumStore.ts
│   │
│   ├── theme/
│   │   ├── colors.ts                 # Paletas dark/light
│   │   ├── typography.ts             # Fuentes y tamaños
│   │   ├── spacing.ts                # Sistema de espaciado
│   │   └── index.ts
│   │
│   ├── types/                        # TypeScript types globales
│   │   ├── match.types.ts
│   │   ├── player.types.ts
│   │   ├── tournament.types.ts
│   │   ├── ranking.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── score.utils.ts
│   │   └── format.utils.ts
│   │
│   └── constants/
│       ├── config.ts                 # Variables de entorno
│       └── strings.ts                # Textos de la app
│
├── backend/                          # Backend Node.js (repo separado o monorepo)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── matches.routes.ts
│   │   │   ├── players.routes.ts
│   │   │   ├── rankings.routes.ts
│   │   │   ├── tournaments.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── payments.routes.ts
│   │   ├── services/
│   │   │   ├── padelapi.service.ts   # Wrapper de padelapi.org
│   │   │   ├── notifications.service.ts
│   │   │   ├── payments.service.ts
│   │   │   └── cache.service.ts
│   │   ├── websocket/
│   │   │   └── liveMatch.ws.ts
│   │   └── app.ts
│   └── package.json
│
├── android/
├── ios/
├── .env
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```

---

## 7. Navegación

### Estructura de navegación completa

```
RootNavigator (Stack)
│
├── [No autenticado] → AuthNavigator (Stack)
│   ├── WelcomeScreen        (pantalla inicial)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── [Autenticado] → AppNavigator (Bottom Tab)
    │
    ├── Tab: Inicio
    │   └── HomeScreen
    │
    ├── Tab: Partidos (MatchesNavigator - Stack)
    │   ├── MatchesScreen          (lista: en directo + próximos + pasados)
    │   └── MatchDetailScreen      (detalle con stats y punto por punto)
    │
    ├── Tab: Torneos (TournamentsNavigator - Stack)
    │   ├── TournamentsScreen      (lista de torneos)
    │   └── TournamentDetailScreen (cuadro + resultados)
    │
    ├── Tab: Rankings
    │   └── RankingsScreen         (masculino / femenino + filtros)
    │
    └── Tab: Más (Stack)
        ├── FavoritesScreen        (mis jugadores favoritos)
        ├── PlayerDetailScreen     (perfil de jugador — accesible desde cualquier tab)
        ├── PremiumScreen          (paywall)
        ├── SettingsScreen
        └── NotificationsSettingsScreen
```

### Tab Bar

| Tab | Icono | Badge |
|---|---|---|
| Inicio | 🏠 home | — |
| Partidos | 🎾 tennis-ball | Número de partidos en directo |
| Torneos | 🏆 trophy | — |
| Rankings | 📊 bar-chart | — |
| Más | ☰ menu | — |

### Tipos de navegación (navigation/types.ts)

```typescript
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Matches: undefined;
  Tournaments: undefined;
  Rankings: undefined;
  More: undefined;
};

export type MatchesStackParamList = {
  MatchesList: undefined;
  MatchDetail: { matchId: string };
};

export type TournamentsStackParamList = {
  TournamentsList: undefined;
  TournamentDetail: { tournamentId: string };
};

export type MoreStackParamList = {
  Favorites: undefined;
  PlayerDetail: { playerId: string };
  Premium: undefined;
  Settings: undefined;
  NotificationsSettings: undefined;
};
```

---

## 8. Pantallas y flujos

### 8.1 Flujo de autenticación

```
App abre
    │
    ├── Token válido en MMKV? → SÍ → HomeScreen
    │
    └── NO → WelcomeScreen
              │
              ├── "Iniciar sesión" → LoginScreen
              │       │
              │       ├── Email + Password → Supabase Auth → HomeScreen
              │       ├── Google Sign In → HomeScreen
              │       ├── Apple Sign In → HomeScreen
              │       └── "¿Olvidaste tu contraseña?" → ForgotPasswordScreen
              │
              └── "Registrarse" → RegisterScreen
                      │
                      └── Email + Password → Verificación email → HomeScreen
```

### 8.2 HomeScreen

Pantalla principal con resumen de todo lo relevante:

- **Sección "En directo ahora"** — scroll horizontal de partidos en curso (si los hay)
- **Sección "Mis favoritos"** — partidos del día que involucran jugadores favoritos
- **Sección "Próximos partidos"** — los siguientes partidos del torneo activo
- **Sección "Ranking top 5"** — snapshot rápido masculino + femenino
- **Sección "Último torneo"** — resultado del torneo más reciente

### 8.3 MatchesScreen

Lista de partidos con 3 pestañas (segmented control):

- **En directo** — partidos en curso, actualizados en tiempo real
- **Hoy** — todos los partidos del día
- **Resultados** — partidos pasados con filtro por torneo

Cada `MatchCard` muestra:
- Pareja A vs Pareja B con avatares
- Marcador actual por sets
- Indicador LIVE (si está en curso) con animación pulsante
- Torneo y ronda

### 8.4 MatchDetailScreen

Pantalla más importante de la app. Dividida en secciones con scroll:

**Header:**
- Nombre del torneo y ronda
- Estado: LIVE / Finalizado / Próximo
- Tiempo de partido (si en directo)

**Marcador principal:**
- Nombres y avatares de ambas parejas
- Marcador de sets (grande y claro)
- Marcador del juego actual (si en directo)
- Indicador de servicio

**Tabs de contenido:**
- `Estadísticas` — tabla comparativa de stats entre ambas parejas
- `Punto a punto` — historial cronológico de todos los puntos
- `Head to Head` — historial de enfrentamientos anteriores entre estas parejas

**Estadísticas detalladas (datos de padelapi.org):**

| Stat | Descripción |
|---|---|
| Puntos ganados | Total y % |
| Errores no forzados | Total |
| Winners | Golpes ganadores directos |
| Dobles faltas | En el servicio |
| Puntos de break | Convertidos / totales |
| % de primer servicio | |
| Puntos ganados con 1er servicio | % |
| Puntos ganados con 2do servicio | % |

### 8.5 TournamentsScreen

Lista de torneos con filtros:
- Filtro por circuito: Premier Padel / FIP
- Filtro por estado: En curso / Próximos / Finalizados
- Filtro por categoría: Masculino / Femenino

### 8.6 TournamentDetailScreen

- Info del torneo (ciudad, fechas, prize money, superficie)
- Cuadro (draw bracket) interactivo
- Lista de participantes
- Resultados por ronda

### 8.7 RankingsScreen

- Toggle Masculino / Femenino
- Lista de jugadores con posición, nombre, país, puntos
- Cambio de posición respecto a semana anterior (↑↓)
- Buscador de jugador
- Al pulsar un jugador → navega a PlayerDetailScreen

### 8.8 PlayerDetailScreen

- Avatar, nombre, país, edad
- Ranking actual
- Estadísticas de la temporada
- Últimos partidos jugados
- Historial de torneos
- Botón "Seguir / Dejar de seguir" (añadir a favoritos)

### 8.9 FavoritesScreen

- Lista de jugadores que el usuario sigue
- Para cada jugador: último resultado + próximo partido
- Acceso rápido al perfil de cada uno
- CTA para ir a PremiumScreen si tiene más de 2 favoritos y no es premium

### 8.10 PremiumScreen (Paywall)

- Lista de beneficios del plan premium vs gratuito
- Opción mensual y anual (anual con descuento destacado)
- Botón de compra nativa (StoreKit / Google Play)
- "Restaurar compras"
- Términos y política de privacidad

### 8.11 SettingsScreen

- Cuenta (email, cambiar contraseña, cerrar sesión)
- Apariencia (dark mode / light mode / sistema)
- Notificaciones → NotificationsSettingsScreen
- Suscripción premium
- Sobre la app (versión, contacto, privacidad, términos)

---

## 9. Features detalladas

### 9.1 Marcador en directo

**Usuarios gratuitos:**
- Polling cada 30 segundos a la API del backend
- Muestra marcador actualizado pero con latencia

**Usuarios premium:**
- Conexión WebSocket directa (a través del backend)
- Actualización en tiempo real en cada punto
- Animación de cambio de marcador

**Flujo técnico (premium):**
```
App abre MatchDetailScreen (partido en directo)
    │
    └── useLiveMatch(matchId) hook
            │
            ├── Conecta WebSocket al backend
            │   Backend → padelapi.org WebSocket
            │
            ├── Recibe eventos: { type: 'score_update', data: {...} }
            │
            └── Actualiza Zustand store → UI re-renderiza
```

### 9.2 Sistema de favoritos

- Máximo 2 jugadores en plan gratuito, ilimitado en premium
- Los favoritos se guardan en Supabase (sincronizados entre dispositivos)
- Al añadir un favorito → se suscribe automáticamente a notificaciones de sus partidos
- En HomeScreen aparecen los partidos del día de sus favoritos destacados

### 9.3 Notificaciones push

**Tipos de notificaciones:**

| Tipo | Cuándo se envía | Plan |
|---|---|---|
| Partido a punto de empezar | 15 min antes | Premium |
| Inicio de partido | Al comenzar | Premium |
| Cambio de marcador | Cada set | Premium |
| Partido finalizado | Al terminar | Premium |
| Nuevo torneo disponible | Al publicarse el cuadro | Todos |

**Flujo técnico:**
```
Backend (cron job cada minuto)
    │
    ├── Consulta padelapi.org: partidos en curso
    │
    ├── Detecta cambios de marcador / inicio / fin
    │
    ├── Busca en Supabase: usuarios que siguen a estos jugadores
    │
    └── Envía notificación vía Firebase Cloud Messaging
            │
            └── Dispositivo recibe y muestra notificación
                    │
                    └── Al pulsar → abre MatchDetailScreen
```

### 9.4 Tema visual (dark/light)

El sistema de temas se gestiona con un ThemeContext + MMKV para persistir la preferencia:

```typescript
// theme/colors.ts
export const darkTheme = {
  background: '#0D0D0D',
  surface: '#1A1A2E',
  surfaceElevated: '#16213E',
  primary: '#00D4AA',        // Verde pádel
  primaryDark: '#00A884',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  border: '#2A2A3E',
  live: '#FF4444',           // Rojo para LIVE
  success: '#00D4AA',
  error: '#FF4444',
};

export const lightTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#F0F0F0',
  primary: '#006B55',
  primaryDark: '#004D3D',
  text: '#0D0D0D',
  textSecondary: '#606070',
  border: '#E0E0E0',
  live: '#CC0000',
  success: '#006B55',
  error: '#CC0000',
};
```

---

## 10. API y datos

### 10.1 padelapi.org — Endpoints principales usados

| Endpoint | Datos | Uso en app |
|---|---|---|
| `GET /live` | Partidos en curso | HomeScreen, MatchesScreen |
| `GET /matches` | Lista de partidos | MatchesScreen |
| `GET /matches/:id` | Detalle de partido | MatchDetailScreen |
| `GET /matches/:id/stats` | Estadísticas del partido | MatchDetailScreen |
| `GET /matches/:id/points` | Punto a punto | MatchDetailScreen |
| `GET /players` | Lista de jugadores | PlayersScreen |
| `GET /players/:id` | Perfil de jugador | PlayerDetailScreen |
| `GET /rankings` | Rankings actuales | RankingsScreen |
| `GET /tournaments` | Lista de torneos | TournamentsScreen |
| `GET /tournaments/:id` | Detalle de torneo | TournamentDetailScreen |
| `WS /live/:matchId` | Stream en tiempo real | MatchDetailScreen (premium) |

### 10.2 Backend propio — Responsabilidades

El backend no es un simple proxy. Añade lógica propia:

- **Cache:** Respuestas de padelapi.org cacheadas en Redis (rankings: 5min, partidos pasados: 1h)
- **Rate limiting:** Evita superar los límites de padelapi.org
- **Autenticación:** Valida JWT de Supabase en cada request
- **Lógica de premium:** Decide si el usuario puede acceder a stats detalladas o solo al score básico
- **WebSocket relay:** Retransmite el WS de padelapi.org a los clientes conectados
- **Notificaciones:** Cron jobs que detectan eventos y envían FCM
- **Validación de pagos:** Verifica recibos de Apple y Google

### 10.3 Estrategia de caché en el cliente (TanStack Query)

```typescript
// Configuración de staleTime por tipo de dato
const queryConfig = {
  liveMatches: { staleTime: 30_000 },       // 30s — datos en vivo
  rankings: { staleTime: 300_000 },          // 5min
  tournamentDetail: { staleTime: 60_000 },   // 1min
  playerProfile: { staleTime: 600_000 },     // 10min
  pastMatches: { staleTime: 3_600_000 },     // 1h — datos históricos
};
```

---

## 11. Autenticación y usuarios

### Proveedor: Supabase Auth

**Métodos de login:**
- Email + contraseña
- Google Sign In (`@react-native-google-signin/google-signin`)
- Apple Sign In (`@invertase/react-native-apple-authentication`) — obligatorio en iOS

### Tabla de usuarios en Supabase

```sql
-- Perfil de usuario (extiende auth.users de Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  subscription_platform TEXT,  -- 'ios' | 'android' | null
  fcm_token TEXT,              -- Token para notificaciones push
  theme TEXT DEFAULT 'system', -- 'dark' | 'light' | 'system'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jugadores favoritos
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,          -- ID del jugador en padelapi.org
  player_name TEXT NOT NULL,
  player_avatar_url TEXT,
  notify_match_start BOOLEAN DEFAULT TRUE,
  notify_score_changes BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, player_id)
);

-- Historial de suscripciones
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  platform TEXT NOT NULL,           -- 'ios' | 'android'
  product_id TEXT NOT NULL,
  transaction_id TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Flujo de sesión

```typescript
// store/authStore.ts (Zustand)
interface AuthStore {
  user: User | null;
  session: Session | null;
  isPremium: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  refreshPremiumStatus: () => Promise<void>;
}
```

---

## 12. Notificaciones push

### Configuración

- **iOS:** APNs (Apple Push Notification service)
- **Android:** FCM (Firebase Cloud Messaging)
- **Librería:** `@notifee/react-native` (más completa que react-native-notifications)

### Canales de notificación (Android)

```typescript
await notifee.createChannel({
  id: 'live_scores',
  name: 'Marcadores en directo',
  importance: AndroidImportance.HIGH,
  sound: 'default',
});

await notifee.createChannel({
  id: 'match_start',
  name: 'Inicio de partidos',
  importance: AndroidImportance.HIGH,
});

await notifee.createChannel({
  id: 'general',
  name: 'General',
  importance: AndroidImportance.DEFAULT,
});
```

### Gestión de permisos

Al registrarse por primera vez, se solicitan permisos de notificación. El usuario puede gestionar por tipo de notificación desde NotificationsSettingsScreen.

---

## 13. Diseño y theming

### Principios de diseño

- **Claridad sobre decoración:** El marcador siempre es lo más visible
- **Información densa pero legible:** Muchos datos, bien jerarquizados
- **Feedback inmediato:** Animaciones en cambios de marcador, indicador LIVE pulsante
- **Accesibilidad:** Contraste mínimo WCAG AA, tamaños de fuente adaptables

### Sistema tipográfico

```typescript
// theme/typography.ts
export const typography = {
  score: { fontSize: 48, fontWeight: '700', fontFamily: 'System' },
  scoreSmall: { fontSize: 24, fontWeight: '700' },
  heading1: { fontSize: 22, fontWeight: '700' },
  heading2: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodySmall: { fontSize: 13, fontWeight: '400' },
  caption: { fontSize: 11, fontWeight: '400' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
};
```

### Sistema de espaciado

```typescript
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Componente de marcador en vivo

El marcador en directo es el componente más crítico visualmente:
- Sets: números grandes (48px), negrita, con fondo diferenciado para el ganador
- Indicador LIVE: punto rojo con animación `pulse` usando Reanimated
- Cambio de marcador: animación `flash` suave al actualizarse

---

## 14. Estado global

### Stores de Zustand

```typescript
// store/authStore.ts
// Gestiona: usuario autenticado, sesión, estado premium

// store/favoritesStore.ts  
// Gestiona: lista de jugadores favoritos del usuario
// Sincroniza con Supabase al iniciar y al hacer cambios

// store/themeStore.ts
// Gestiona: preferencia dark/light/system
// Persiste en MMKV

// store/premiumStore.ts
// Gestiona: estado de la suscripción, fecha de expiración
// Valida con el backend al abrir la app
```

### Flujo de datos por pantalla

```
MatchDetailScreen
    │
    ├── useQuery(['match', matchId], fetchMatchDetail)
    │   └── GET /api/matches/:id
    │
    ├── useQuery(['match-stats', matchId], fetchMatchStats)
    │   └── GET /api/matches/:id/stats  [solo premium]
    │
    └── useLiveMatch(matchId)            [solo premium + partido en directo]
        └── WebSocket → eventos de score en tiempo real
```

---

## 15. Roadmap y fases

### Fase 1 — MVP (meses 1-3)

**Objetivo:** Lanzar en App Store y Google Play con las features core.

- [x] Autenticación (email, Google, Apple)
- [x] HomeScreen con resumen
- [x] Lista de partidos (en directo, hoy, pasados)
- [x] Marcador en directo (polling 30s para gratuitos)
- [x] Rankings masculino y femenino
- [x] Lista y detalle de torneos
- [x] Perfil de jugador básico
- [x] Favoritos (máx 2 jugadores, plan gratuito)
- [x] Dark mode / Light mode
- [x] Anuncios AdMob (banner)
- [x] Plan premium con In-App Purchase
- [x] Notificaciones básicas (inicio de partido de favorito)

### Fase 2 — Post-lanzamiento (meses 4-5)

- [ ] WebSocket en tiempo real (premium)
- [ ] Estadísticas detalladas punto a punto (premium)
- [ ] Widget de pantalla de inicio (iOS 16+ / Android)
- [ ] Live Activities en iOS (marcador en pantalla de bloqueo)
- [ ] Head to Head entre parejas
- [ ] Búsqueda de jugadores
- [ ] Notificaciones avanzadas (cambios de marcador)

### Fase 3 — Crecimiento (mes 6+)

- [ ] Inglés como segundo idioma
- [ ] Predicciones con IA (probabilidad de ganar en tiempo real)
- [ ] Estadísticas históricas avanzadas
- [ ] Compartir marcador en redes sociales
- [ ] Apple Watch companion app

---

## 16. Presupuesto

### Costes fijos mensuales (en producción)

| Servicio | Plan | Coste/mes |
|---|---|---|
| padelapi.org | Business | ~80-100€ |
| Railway (backend Node.js) | Starter | ~20€ |
| Supabase | Pro | ~25€ |
| Firebase | Spark (gratuito) | 0€ |
| **Total mensual** | | **~125-145€** |

### Costes únicos

| Concepto | Coste |
|---|---|
| Apple Developer Account | 99€/año |
| Google Play Developer | 25€ (único) |
| **Total único** | **~124€** |

### Break-even con Freemium

- Plan mensual: 2,99€ → margen neto ~2,10€ (tras comisión Apple/Google 30%)
- Plan anual: 19,99€ → margen neto ~14€
- **Necesitas ~65 usuarios premium/mes para cubrir costes**

---

## 17. División de trabajo

Con 2 desarrolladores en paralelo, la división recomendada es por capas:

### Desarrollador 1 — Backend + Infraestructura

- Setup de Railway + Supabase + Firebase
- Integración con padelapi.org (REST + WebSocket)
- Todas las rutas del backend Node.js
- Sistema de notificaciones push (cron jobs + FCM)
- Validación de pagos (Apple + Google recibos)
- Base de datos Supabase (schema + RLS policies)

### Desarrollador 2 — Frontend React Native

- Setup del proyecto RN + navegación
- Sistema de theming (dark/light)
- Todas las pantallas y componentes
- Integración con TanStack Query
- Stores de Zustand
- Integración de AdMob
- Integración de react-native-iap

### Puntos de sincronización

| Semana | Sincronización |
|---|---|
| Semana 1 | Definir contratos de API (tipos TypeScript compartidos) |
| Semana 2 | Backend básico levantado, frontend conecta con datos reales |
| Semana 4 | Features core completas, testing interno |
| Semana 6 | Beta cerrada con usuarios reales |
| Semana 10-12 | Revisión final y submit a stores |

---

*PRD v1.0 — Sujeto a cambios según feedback del equipo y resultados de la beta.*
