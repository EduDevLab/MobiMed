# 💊 MobiMed — Sistema de Recordatorios de Medicina

Aplicación móvil multiplataforma (**React Native + TypeScript**) para garantizar la
adherencia al tratamiento médico: registra medicamentos escaneando la caja con la
cámara (OCR con **Google ML Kit**) o manualmente, programa **alarmas exactas**
locales y persiste todo en **SQLite** en el dispositivo (offline-first).

Implementación de
[`arquitectura_del_sistema_app_de_recordatorios_de_medicina.md`](../arquitectura_del_sistema_app_de_recordatorios_de_medicina.md)
bajo los principios de **Clean Architecture**.

---

## 🏗️ Arquitectura

```
src/
├── core/                          # Infraestructura transversal
│   ├── db/                        # Conexión SQLite + migraciones
│   ├── di/                        # Contenedor de dependencias (Service Locator)
│   ├── errors/                    # `Failure` + tipo `Either`
│   └── utils/                     # ids, fechas, extracción OCR con regex
├── features/
│   ├── medicines/                 # Dominio funcional: medicamentos
│   │   ├── data/                  # datasources (SQLite, ML Kit OCR), models, repos
│   │   ├── domain/                # entities, repository interfaces, use cases
│   │   └── presentation/          # store Redux + screens
│   └── reminders/                 # Dominio funcional: notificaciones y alarmas
│       ├── data/                  # datasources, repos, scheduler Notifee
│       ├── domain/                # entities, interfaces, use cases
│       └── presentation/          # store Redux + screens
├── app/                           # Composición raíz, store y navegación
│   ├── navigation/
│   ├── store.ts
│   └── ui/                        # Componentes de UI compartidos
├── App.tsx                        # Punto de arranque
└── index.js
```

- **Dominio nunca depende de la UI ni de librerías nativas**: los casos de uso
  reciben repositorios/servicios vía interfaces.
- **Offline-first**: toda la persistencia vive en SQLite local
  (`react-native-quick-sqlite`).
- **Resiliencia en notificaciones**: las alertas usan **AlarmManager** (alarmas
  exactas) vía Notifee, con el permiso `SCHEDULE_EXACT_ALARM`/`USE_EXACT_ALARM`.

## 🧩 Stack

| Capa | Tecnología |
|---|---|
| App | React Native 0.87 · TypeScript |
| Estado | Redux Toolkit |
| Persistencia | SQLite (`react-native-quick-sqlite`) |
| Preferencias | AsyncStorage (tema, persistido) |
| OCR | Google ML Kit (`@react-native-ml-kit/text-recognition`) |
| Cámara | `react-native-image-picker` |
| Alarmas | `@notifee/react-native` (triggers AlarmManager exactos) |
| Selectores | `@react-native-community/datetimepicker` |
| Navegación | React Navigation (native-stack) |
| Pruebas | Jest (casos de uso con repos mockeados) |

## 🗄️ Esquema SQLite

```sql
CREATE TABLE medicines (
  id          TEXT PRIMARY KEY NOT NULL,
  name        TEXT NOT NULL,
  dosage      TEXT NOT NULL,
  presentation TEXT NOT NULL,
  photo_path  TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE reminders (
  id             TEXT PRIMARY KEY NOT NULL,
  medicine_id    TEXT NOT NULL,
  start_datetime TEXT NOT NULL,      -- ISO local primera toma "2026-10-08T08:00"
  interval_minutes INTEGER NOT NULL, -- cada cuántos minutos (480 = 8 h, 270 = 4 h 30 min)
  frequency_days TEXT NOT NULL,      -- JSON [1,3,5] (0=Dom..6=Sáb)
  end_date       TEXT,
  is_active      INTEGER NOT NULL DEFAULT 1
);
```

**Algoritmo de alarmas (por intervalo en minutos):** a partir de `start_datetime` se
generan las ocurrencias `t₀ = inicio`, `tₙ₊₁ = tₙ + interval_minutes`, filtrando los
días no permitidos en `frequency_days`. Con `end_date` se respeta la fecha límite;
sin ella se programan las próximas **500 tomas** (límite nativo de Android). La
granularidad en minutos permite fracciones de hora (p. ej. `270` = 4 h 30 min).
La migración `user_version` v3 convierte las horas existentes a minutos (`* 60`).

## ⚙️ Requisitos de Android

Permisos declarados en `AndroidManifest.xml`:

- `CAMERA`, `VIBRATE`
- `POST_NOTIFICATIONS` (Android 13+)
- `SCHEDULE_EXACT_ALARM` y `USE_EXACT_ALARM` (alarmas exactas, API 31+)

En runtime la app solicita cámara y notificaciones; si las alarmas exactas están
deshabilitadas, abre los ajustes de sistema para activarlas.

## 🔌 Puesta en marcha (Linux/WSL)

```bash
npm install

# Verificación estática y tests
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
npm test

# Build del APK de depuración (requiere JDK 25 — exigido por el template
# RN 0.87 vía android/gradle/gradle-daemon-jvm.properties — y Android SDK)
export JAVA_HOME=$HOME/.local/java/jdk-25.0.4.1+1
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$JAVA_HOME/bin:$PATH
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## ✅ Pruebas unitarias

Los casos de uso principales están cubiertos con repositorios mockeados:

| Suite | Cubre |
|---|---|
| `ScanMedicineBarcodeOrTextUseCase` | Entrada → OCR → `Medicine` pre-llenado; fallos |
| `SaveMedicineAndScheduleRemindersUseCase` | Persistencia + programación de alarmas; propagación de fallos |
| `medicineExtractor` | Regex de nombre/dosis/presentación |
| `dates` | `intervalOccurrences`: secuencia por intervalo, días permitidos, fin y límite |

## 🔄 Flujo de la app

1. **Lista** de medicamentos con su **logo** y acceso a **Configuración** en el
   header (⚙️): ahí está el selector de tema (Sistema / Claro / Oscuro,
   persistido en AsyncStorage).
2. **Escanear la caja**: cámara → ML Kit OCR → regex → `Medicine` pre-llenado
   para confirmación (caso de uso `ScanMedicineBarcodeOrTextUseCase`).
3. **Registro manual** o confirmación del escaneo + **programación de
   recordatorios** (primera toma con DateTimePicker nativo, intervalo de horas y
   minutos —p. ej. cada 4 h 30 min—, días de la semana y rango de fechas).
4. Al guardar se ejecuta `SaveMedicineAndScheduleRemindersUseCase`: inserta en
   SQLite y registra las alarmas exactas por intervalo.
5. **Detalle**: consulta recordatorios, cancela/reactiva y elimina (cancela
   también todas sus alarmas).