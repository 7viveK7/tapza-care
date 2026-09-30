# Tapza Care

A production-grade React Native healthcare application built with Expo. Features doctor discovery and appointment booking, prescription tracking with daily dose scheduling, an offline-resilient remote layout config system, and an in-app developer panel.

---

## Quick Links

- **Live EAS Build (Android APK):** [Download & View Build on Expo](https://expo.dev/accounts/visify/projects/tapza-care/builds/99246ee3-82e4-47e7-91eb-edddab027d52)
- **Demo Video & Screenshots:** Located in the [`/docs`](./docs) folder of this repository.
- **GitHub Repository:** [View Repository on GitHub]https://github.com/7viveK7/tapza-care

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [How to Run](#how-to-run)
3. [Running Tests](#running-tests)
4. [Download & Install Build](#download--install-build)
5. [Folder Structure & Rationale](#folder-structure--rationale)
6. [Architecture Decisions](#architecture-decisions)
7. [What Was Cut & Why](#what-was-cut--why)
8. [Time Spent](#time-spent)

---

## Prerequisites

- **Node.js**: v18 LTS or higher (v20+ recommended)
- **npm**: v9 or higher
- **Expo Go App** (optional): For testing directly on a real device
- **iOS Simulator / Android Emulator** (optional)

---

## How to Run

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd tapza-care
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the Metro bundler:**

   ```bash
   npx expo start
   ```

4. **Launch the application:**
   - **Expo Go**: Scan the QR code in your terminal using the Expo Go app.
   - **iOS Simulator**: Press `i` in the terminal.
   - **Android Emulator**: Press `a` in the terminal (emulator must be running).

> **Note:** No server setup is needed. All data is served through an in-process mock client initialized from `src/mock/`.

---

## Running Tests

Unit tests execute in Node via `jest-expo` without requiring a device or emulator. Native APIs (Reanimated, AsyncStorage, Notifications, etc.) are mocked in `jest.setup.js`.

```bash
# Run test suite once
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Download & Install Build

To install and run the build directly on an Android device:

1. **Download the APK:** Use the [EAS Build Download Link]
   https://expo.dev/accounts/visify/projects/tapza-care/builds/99246ee3-82e4-47e7-91eb-edddab027d52.
2. **Install on Android:**
   - Open the `.apk` file on your device.
   - Enable **"Install from unknown sources"** if prompted by your system.

---

## Folder Structure & Rationale

```
tapza-care/
├── docs/                       # Screenshots and 2–3 minute video demo
├── app/                        # Expo Router file-based screens and navigation
│   ├── _layout.tsx             # Root provider stack (Theme, Query, Gesture, BottomSheet)
│   ├── (tabs)/                 # Bottom tab navigation routes
│   ├── doctor/[id].tsx         # Doctor detail modal & booking sheet container
│   └── prescription/[id].tsx   # Detailed prescription view
│
├── src/
│   ├── core/                   # Shared infrastructure (API client, config schemas, theme engine)
│   ├── features/               # Domain modules containing UI, hooks, and logic together
│   │   ├── home/               # Dynamic feed, section registry, and collapsing header
│   │   ├── booking/            # Slot selector, optimistic updates, and success states
│   │   ├── prescriptions/      # Prescription listing, dose scheduler, and storage persistence
│   │   ├── dev/                # Developer panel for live overrides
│   │   └── notifications/      # Local notification handling for dose reminders
│   ├── mock/                   # In-memory database and seed JSON files
│   ├── shared/                 # Utilities, hooks, and generic components
│   └── types/                  # Global TypeScript types
│
├── __tests__/                  # Unit and integration test files
└── jest.setup.js               # Native module mocks for Jest environment
```

### Why this structure?

- **Feature-first organization:** Placing screens, components, and state logic together under `src/features/` keeps domain code cohesive and easier to scale.
- **Decoupled core services:** System-level capabilities like network abstractions, theme resolution, and schema validation reside in `src/core/` to prevent circular dependencies.

---

## Architecture Decisions

- **Remote-Config Driven UI:** The Home screen layout is dictated by a JSON payload fetched from `GET /config`. Layout payloads are parsed and validated through Zod. Unrecognized section types fall back gracefully without breaking the view.
- **Offline Resilience:** Successful config responses are saved to `AsyncStorage`. If network calls fail on boot, the app falls back to cached layout configurations.
- **Optimistic Booking State:** Appointment requests update local cache immediately using TanStack Query. If an error or a simulated 409 conflict occurs via the Dev Panel, state rolls back instantly with an error notification.
- **Centralized Theme Tokens:** Visual properties (colors, typography scaling, spacing) are governed by central theme tokens. Switching to the Festival Theme updates styles across the app in a single re-render cycle.

---

## What Was Cut & Why

- **Live Backend & Auth:** Replaced with an in-process mock client to ensure predictable, self-contained execution without external server reliance.
- **Server Push Notifications:** Implemented as scheduled local notifications via `expo-notifications` to avoid setting up external push credentials.
- **Bookings Tab:** Kept as a static placeholder to focus development time on key interactions: home feed rendering, booking flows with failure recovery, dev controls, and dose scheduling.

---

## Time Spent

| Phase                                                              | Time       |
| :----------------------------------------------------------------- | :--------- |
| Project structure, theme configuration, and provider chain setup   | ~0.5 h     |
| Dynamic home feed, layout registry, and collapsing header          | ~1.5 h     |
| Doctor details, slot booking, optimistic state, and recovery flows | ~2.0 h     |
| Prescription details and daily dose persistence                    | ~1.5 h     |
| Developer panel, offline cache fallback, and reminder hooks        | ~1.0 h     |
| Unit testing, mocks, and test assertions                           | ~1.5 h     |
| Demo recording, media export, build generation, and docs           | ~0.5 h     |
| **Total**                                                          | **~8.5 h** |
