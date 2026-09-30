# Tapza Care

A production-grade React Native healthcare app built with Expo. Covers doctor discovery and booking, prescription tracking with daily dose scheduling, an offline-resilient remote config system, and a runtime developer panel.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Running Tests](#running-tests)
4. [Project Structure](#project-structure)
5. [Architecture & Design Choices](#architecture--design-choices)
6. [Feature Walkthrough](#feature-walkthrough)
7. [Developer Panel](#developer-panel)
8. [Trade-offs & Scope Decisions](#trade-offs--scope-decisions)
9. [Time Spent](#time-spent)
10. [Building a Release APK / Expo Go](#building-a-release-apk--expo-go)

---

## Prerequisites

| Tool             | Minimum version          | Notes                                   |
| ---------------- | ------------------------ | --------------------------------------- |
| Node.js          | 18 LTS                   | v20+ recommended                        |
| npm              | 9+                       | ships with Node                         |
| Expo CLI         | auto-installed via `npx` | no global install needed                |
| iOS Simulator    | Xcode 15+                | macOS only                              |
| Android Emulator | Android Studio 2023+     | or physical device                      |
| Expo Go app      | latest                   | fastest way to preview on a real device |

---

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd tapza-care

# 2. Install dependencies
npm install

# 3. Start the Metro bundler
npx expo start
```

You will see a QR code in the terminal. Choose one of:

- **Expo Go (iOS or Android)** — scan the QR code with the Expo Go app.
- **iOS Simulator** — press `i` in the terminal.
- **Android Emulator** — press `a` in the terminal (emulator must already be running).
- **Web** — press `w` (limited — native animations may not render).

The app uses an in-process mock API (no backend required). All data is generated locally from `src/mock/`.

---

## Running Tests

```bash
# Run all tests once (CI mode)
npm test

# Watch mode during development
npm run test:watch
```

Expected output:

```
PASS  __tests__/configValidation.test.ts  (28 tests)
PASS  __tests__/sectionRenderer.test.ts   (25 tests)
PASS  __tests__/bookingFlow.test.ts       (31 tests)

Test Suites: 3 passed, 3 total
Tests:       84 passed, 84 total
```

Tests run in Node via `jest-expo` — no simulator or device required. The setup file (`jest.setup.js`) mocks every native module (Reanimated, AsyncStorage, Haptics, Notifications, Gesture Handler, Bottom Sheet) so the logic layer can be exercised in isolation.

---

## Project Structure

```
tapza-care/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root provider chain (GestureHandler → Query → Theme → BottomSheet)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home tab → HomeScreen
│   │   ├── bookings.tsx        # Bookings tab (placeholder)
│   │   ├── prescriptions.tsx   # Prescriptions tab → PrescriptionsList
│   │   └── profile.tsx         # Profile tab with DevPanel launcher
│   ├── doctor/[id].tsx         # Doctor detail screen → BookingSheet
│   └── prescription/[id].tsx   # Prescription detail → PrescriptionDetailScreen
│
├── src/
│   ├── core/                   # Infrastructure — no UI
│   │   ├── api/
│   │   │   ├── client.ts       # Mock API client (GET /config, /doctors, /slots, POST /bookings, GET /prescriptions)
│   │   │   └── devSettings.ts  # Mutable singleton: latencyMs, forceFailure, isFestivalTheme
│   │   ├── config/
│   │   │   ├── schema.ts       # Zod validation for LayoutConfig; parseLayoutConfig() with safe fallback
│   │   │   └── cache.ts        # AsyncStorage read/write for offline LayoutConfig fallback
│   │   ├── query/
│   │   │   └── QueryProvider.tsx  # TanStack Query v5 client (staleTime 30s, retry 1)
│   │   ├── storage/
│   │   │   └── asyncStorage.ts # Typed get/set/remove/merge wrapper + STORAGE_KEYS
│   │   └── theme/
│   │       ├── ThemeContext.tsx # ThemeProvider — holds ThemeTokens state, exposes updateThemeTokens()
│   │       ├── createTheme.ts  # Derives AppTheme (scaled spacing, typography) from ThemeTokens
│   │       ├── resolveColor.ts # resolveThemeColor() and resolveGradientColors() helpers
│   │       ├── tokens.ts       # Base numeric constants (spacing, typography sizes, touch targets)
│   │       └── useTheme.ts     # Hook — throws if called outside ThemeProvider
│   │
│   ├── features/               # Domain features — each self-contained
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx            # React Query + scroll handler + FlatList of sections
│   │   │   ├── HomeSkeleton.tsx          # Loading skeleton matching section shapes
│   │   │   ├── LayoutConfigContext.tsx   # Provides LayoutConfig to section subtree (copy, features)
│   │   │   ├── useLayoutConfig.ts        # useQuery with offline cache fallback
│   │   │   ├── registry.ts               # sectionRegistry: type string → ComponentType
│   │   │   ├── components/
│   │   │   │   ├── CollapsingHeader.tsx  # Reanimated header (height + opacity + font-size interpolation)
│   │   │   │   ├── SectionBackground.tsx # Solid / gradient / image+overlay wrapper
│   │   │   │   └── SectionRenderer.tsx   # Null-guard + FadeInDown entry animation
│   │   │   └── sections/
│   │   │       ├── HeroBanner.tsx        # Full-width greeting + title + subtitle
│   │   │       ├── CategoryChips.tsx     # Horizontal scroll, 44pt chips
│   │   │       ├── QuickActions.tsx      # 2-column emoji tile grid
│   │   │       ├── ServiceGrid.tsx       # 2/3-column image cards with ₹ price + badge
│   │   │       ├── DoctorCarousel.tsx    # Horizontal scroll doctor cards
│   │   │       └── OfferStrip.tsx        # Thin promotional band with auto contrast text
│   │   │
│   │   ├── booking/
│   │   │   ├── BookingSheet.tsx          # @gorhom/bottom-sheet modal, 2 snap points
│   │   │   ├── components/
│   │   │   │   ├── DateStrip.tsx         # 14-day horizontal date picker, snap scroll
│   │   │   │   ├── SlotGrid.tsx          # Morning/evening slot chips, unavailable dimming
│   │   │   │   └── SuccessAnimation.tsx  # Reanimated spring checkmark (no Lottie / SVG)
│   │   │   └── hooks/
│   │   │       ├── useSlots.ts           # useQuery for GET /slots?doctorId&date
│   │   │       └── useBookSlot.ts        # useMutation with optimistic update + 409 rollback
│   │   │
│   │   ├── prescriptions/
│   │   │   ├── PrescriptionsList.tsx         # FlashList + React Query + skeleton/empty/error
│   │   │   ├── PrescriptionDetailScreen.tsx  # Hero card, diagnosis, DoseSchedule, MedicineCards
│   │   │   ├── components/
│   │   │   │   ├── PrescriptionCard.tsx  # Doctor / date / diagnosis / timing chips
│   │   │   │   ├── MedicineCard.tsx      # Drug name, dose, duration, timing chips, instructions
│   │   │   │   └── DoseSchedule.tsx      # Morning/afternoon/night groups, Taken/Skipped chips
│   │   │   └── hooks/
│   │   │       └── useDoseTracker.ts     # AsyncStorage persistence, optimistic toggle cycle
│   │   │
│   │   ├── dev/
│   │   │   └── DevPanel.tsx              # Latency presets, force-failure, festival theme switcher
│   │   │
│   │   └── notifications/
│   │       └── useDoseReminders.ts       # expo-notifications daily reminders per timing slot
│   │
│   ├── mock/                   # In-process mock backend (no network)
│   │   ├── db.ts               # MockDB: getSlots(), bookSlot(), getPrescriptions(), getConfig()
│   │   └── data/
│   │       ├── config.normal.json    # Normal day layout config + teal tokens
│   │       ├── config.festival.json  # Diwali layout config + amber/red tokens
│   │       ├── doctors.json          # 7 doctors across Hyderabad and Vijayawada
│   │       └── prescriptions.json    # 4 prescriptions with 12 medicines total
│   │
│   ├── shared/                 # Cross-feature reusables
│   │   ├── components/
│   │   │   ├── ErrorState.tsx   # Error view with retry button (44pt)
│   │   │   ├── EmptyState.tsx   # Empty view with optional action
│   │   │   └── Skeleton.tsx     # Bone + SkeletonCard (animated opacity pulse)
│   │   ├── hooks/
│   │   │   └── useHaptics.ts    # selectionFeedback, confirmFeedback, successFeedback, themeSwitchFeedback, doseToggleFeedback, ...
│   │   └── utils/
│   │       ├── date.ts          # formatSlotTime, getSlotPeriod, toISODate, getNextDays, formatRelativeDay
│   │       ├── currency.ts      # formatInr (Intl), formatInrCompact
│   │       └── i18n.ts          # t(key, params?) with en/hi/te string catalogue, setLocale/getLocale
│   │
│   └── types/                  # Domain types (no runtime code)
│       ├── config.ts            # LayoutConfig, ThemeTokens, HomeSection, DEFAULT_THEME_TOKENS
│       ├── booking.ts           # Slot, BookingPayload, BookingResponse, DoseRecord
│       ├── doctor.ts            # Doctor, ClinicCity, SpokenLanguage
│       ├── prescription.ts      # Prescription, Medicine, Timing, DoseRecord
│       └── index.ts             # Barrel re-export
│
├── __tests__/
│   ├── configValidation.test.ts  # 28 tests — Zod schema validation
│   ├── sectionRenderer.test.ts   # 25 tests — registry and null-guard
│   └── bookingFlow.test.ts       # 31 tests — API, optimistic updates, 409 recovery
│
├── jest.setup.js       # Native module mocks for Jest/Node environment
├── jest.config.*       # Embedded in package.json (preset jest-expo)
├── app.json            # Expo app config (name, slug, icon, splash)
├── package.json
├── tsconfig.json       # Strict mode, @/ alias → ./src/
├── AI_LOG.md           # Development log (this project)
└── README.md           # This file
```

---

## Architecture & Design Choices

### 1. Remote-config-driven home screen

The home screen layout is not hardcoded. `GET /config` returns a `LayoutConfig` object that specifies an ordered array of `HomeSection` items, each with a `type` string, `background` config, and typed `items`. The `sectionRegistry` maps type strings to React components. `SectionRenderer` does a single lookup and returns `null` for unknown types — forward-compatible with new section types the server might send before the app is updated.

This mirrors how Zepto/Swiggy power their home-feed: the server controls what appears without a client release. The Zod schema validates every incoming config and falls back to `DEFAULT_LAYOUT_CONFIG` on any parse failure, so the app never crashes on a malformed payload.

### 2. Theme token system

Colours and scale multipliers are stored in `ThemeTokens` (a plain object). `createTheme(tokens)` derives `AppTheme` — scaling all spacing and typography values by `spacingScale` and `typeScale`. Every component calls `useTheme()` and reads from `theme.colors.*`, `theme.spacing.*`, `theme.typography.sizes.*`. Zero hardcoded colours anywhere in the feature code.

The festival theme switch in `DevPanel` calls `updateThemeTokens()` directly (the `ThemeContext` state setter), which re-renders all `useTheme()` consumers synchronously in the same React batch. The subsequent `invalidateQueries(["config"])` then triggers a background refetch to also update the section layout to the festival JSON.

### 3. Offline resilience

`useLayoutConfig` wraps `apiClient("/config")` in a try/catch. On success it writes the response to AsyncStorage via `writeConfigCache()`. On failure it reads `readConfigCache()` — if a cached version exists, it returns that instead of throwing, so React Query records a successful response and the UI renders as normal. The user sees stale data instead of an error screen.

### 4. Optimistic booking

`useBookSlot` follows React Query's documented optimistic pattern:

1. `onMutate`: cancel in-flight refetches → snapshot previous slots → set target slot `available: false` in cache.
2. `onError`: restore snapshot from context → show `Alert` (differentiated messaging for 409 vs generic error).
3. `onSuccess`: invalidate the slots query so the server's authoritative state replaces the optimistic one.

The slot feels booked the instant the user taps "Confirm" with no visible latency.

### 5. Dose persistence

`useDoseTracker` uses a flat `Record<string, boolean>` map keyed by composite strings (`{prescriptionId}:{medicineId}:{date}:{timing}`). State is loaded from AsyncStorage once on mount and held in `useState` for O(1) synchronous reads on every chip render. Writes are fire-and-forget — toggling never blocks the UI on storage I/O. The map is written back as a single `setItem` call after every toggle.

### 6. Provider chain

```
GestureHandlerRootView   ← required outermost by react-native-gesture-handler v2
  QueryProvider          ← TanStack Query context
    ThemeProvider        ← ThemeTokens state, updateThemeTokens()
      BottomSheetModalProvider  ← portal layer for BottomSheetModal
        Stack            ← Expo Router screen navigator
```

Order matters: `GestureHandlerRootView` must be outermost for `@gorhom/bottom-sheet` v5 gesture recognition. `BottomSheetModalProvider` must be inside `ThemeProvider` so the DevPanel inside the bottom sheet can call `useTheme()`.

---

## Feature Walkthrough

### Home Screen

- Fetch `GET /config` → validate with Zod → apply `tokens` to `ThemeContext` → render sections.
- Collapsing header shrinks from 96pt to 52pt as you scroll (height, subtitle opacity, title size all interpolated).
- Unknown section types in the config are silently skipped — no crash, no visible gap.

### Doctor Booking

- Tap any doctor card → `app/doctor/[id].tsx` (modal presentation).
- Tap "Book Appointment" → `BookingSheet` slides up.
- Choose a date from the 14-day strip → slots load for that date.
- Tap a slot → CTA unlocks showing the selected time.
- Confirm → optimistic mark, POST /bookings, SuccessAnimation on confirmation.
- 409 conflict → rollback + Alert with the `copy.slotUnavailable` message from the config.

### Prescriptions

- List screen: React Query fetch → FlashList of `PrescriptionCard` items with FadeInDown stagger.
- Detail screen: primary-coloured hero card (doctor, date, patient) + curved body overlap.
- Today's DoseSchedule: morning / afternoon / night periods with progress badges.
- Tap a chip: pending → taken (green) → skipped (red) → pending. State persists across app restarts via AsyncStorage.

### Profile & Dev Panel

- Profile screen: themed, replaces hardcoded colours from the original placeholder.
- Tap "🛠 Developer Panel" → bottom sheet with:
  - Latency presets: `0 / 300 / 800 / 1500 / 2000 ms`
  - Force failure toggle → `devSettings.forceFailure = true` + immediate query invalidation
  - Festival theme toggle → `updateThemeTokens()` (instant) + query invalidation (background refetch)
  - "Reset All" → clears devSettings, wipes AsyncStorage config cache, refetches

---

## Developer Panel

Accessible from Profile → "Developer Panel".

| Control             | Effect                                               | Takes effect                                         |
| ------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Latency 0 ms        | No delay (default)                                   | Next API call                                        |
| Latency 300–2000 ms | Simulated network lag                                | Next API call                                        |
| Force Failure       | Every API call throws 500                            | Immediately (invalidates config query)               |
| Festival Theme      | Switches colour palette + re-fetches festival layout | Frame-synchronous (token update) + next config fetch |
| Reset All           | Clears all overrides and AsyncStorage config cache   | Immediately                                          |

The panel is intentionally **not persisted** to AsyncStorage. Developer overrides must reset to safe defaults on every cold start to prevent accidentally shipping an app with `forceFailure: true`.

---

## Trade-offs & Scope Decisions

### Scope kept

- Full end-to-end flow: Home → Doctor detail → Booking → Prescriptions → Dose tracking.
- Remote config with Zod validation, offline fallback, and festival theme.
- Optimistic booking with 409 recovery matching production-quality React Query patterns.
- Dose persistence to AsyncStorage with a clean pending/taken/skipped state machine.
- Developer panel with instant, non-reload dev overrides.
- 84 unit tests covering schema validation, section registry, and booking flow.

### Deliberately out of scope

- **Real backend / authentication** — all data is mock. A production deployment would replace `src/core/api/client.ts` with a real HTTP client (axios/fetch) pointing to a backend. The `apiClient` signature is identical so call sites don't change.
- **Push notifications** — `expo-notifications` is installed and `useDoseReminders` schedules local notifications. Push token registration and a backend notification service are not implemented.
- **User accounts / sign-in** — the profile screen shows a static user. Auth would sit above `QueryProvider` in the provider chain.
- **Bookings tab** — shows a static placeholder. The booking data model (`BookingResponse`) is fully typed; a `useBookings()` query hook and `BookingCard` component would complete it.
- **Image uploads / camera** — prescriptions are read-only mock data; no OCR or upload flow.
- **Accessibility audit** — every interactive element has `accessibilityRole`, `accessibilityLabel`, `accessibilityState`, and `hitSlop`. WCAG AA contrast ratios are maintained by the token system. Full VoiceOver/TalkBack testing was not performed.
- **Internationalisation wiring** — `src/shared/utils/i18n.ts` contains a complete en/hi/te string catalogue with `t(key)` and `setLocale()`. It is not wired to the UI — all strings are still hardcoded at call sites. Wiring would be a string-replacement pass.

### Known technical debt

- `src/components/` (legacy) contains `ThemedText` and `ThemedView` that use an older `src/hooks/use-theme.ts` backed by a separate `src/constants/theme.ts`. These are not used in any feature code but are not removed to keep the original scaffold intact.
- Several stub files in `src/shared/components/` (`Badge`, `Button`, `Card`, `Chip`) remain empty — they were scaffolded for future use but not needed by any current feature.
- `src/core/config/useLayoutConfig.ts` and `src/core/config/defaultConfig.ts` are empty stubs; the real implementations live at `src/features/home/useLayoutConfig.ts` and `src/types/config.ts` respectively.

---

## Time Spent

| Phase                                                                             | Approx. time |
| --------------------------------------------------------------------------------- | ------------ |
| Project setup, provider chain, theme system                                       | 0.5 h        |
| Home screen (sections, registry, skeleton, collapsing header)                     | 1.5 h        |
| Doctor detail + booking flow (sheet, slots, optimistic update, success animation) | 2.0 h        |
| Prescriptions list + detail + dose tracking                                       | 1.5 h        |
| Dev panel, offline cache, i18n, haptics, notifications                            | 1.0 h        |
| Unit tests + Jest configuration + debugging                                       | 1.5 h        |
| AI_LOG.md + README.md                                                             | 0.5 h        |
| **Total**                                                                         | **~8.5 h**   |

---

## Building a Release APK / Expo Go

### Option A — Preview instantly with Expo Go (no build needed)

1. Install [Expo Go](https://expo.dev/go) on your Android or iOS device.
2. Run `npx expo start` in the project directory.
3. Scan the QR code.

No compilation. The bundle runs on the JS engine inside the Expo Go host app.

### Option B — Development build (recommended for testing native modules)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure the project (first time only)
eas build:configure

# Build a development APK for Android (installs on device/emulator)
eas build --platform android --profile development

# Or for iOS simulator
eas build --platform ios --profile simulator
```

### Option C — Production APK via EAS Build

```bash
# Build a production-grade APK
eas build --platform android --profile production
```

EAS Build runs the compilation in Expo's cloud infrastructure. When the build finishes you receive a download link for the `.apk` (Android) or `.ipa` (iOS). The APK can be side-loaded onto any Android device with "Install from unknown sources" enabled.

### Option D — Local Android build (requires Android SDK)

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build debug APK locally
cd android && ./gradlew assembleDebug

# The APK is at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

> **Note:** This project has no custom native modules beyond what Expo manages, so EAS Build (Option B/C) is the recommended path for distributing to testers.
