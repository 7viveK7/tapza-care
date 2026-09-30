# AI Development Log — Tapza Care

This document records every major prompt used during development, AI iterations that produced non-obvious outcomes, suggestions that were rejected or significantly refactored, and the technical justification behind each decision.

---

## Session 1 — Zepto-style Home Screen

### Prompt (paraphrased)

> Implement a remote-JSON-driven Home screen: HeroBanner, CategoryChips, QuickActions, ServiceGrid, DoctorCarousel, OfferStrip. Registry pattern for section types. SectionRenderer with null-guard and Reanimated FadeInDown entry animation. CollapsingHeader using Animated.interpolate. HomeScreen with React Query, ThemeContext token sync, FlatList over sections, HomeSkeleton during load.

### What the AI produced

- Full `sectionRegistry` (`Record<string, ComponentType>`) pattern with `getSectionComponent()` lookup.
- `SectionRenderer` with `if (!Component) return null` guard before any render — the exact safety contract the tests later verify.
- `CollapsingHeader` using `useSharedValue` + `useAnimatedScrollHandler` in `HomeScreen`, with `interpolate(..., Extrapolation.CLAMP)` in the header for height, subtitle opacity, and title font-size — all on the UI thread.
- `HomeSkeleton` with 6 matching shape variants (one per section type) driven by a `sectionTypes` prop so it can preview the actual coming layout rather than generic placeholders.

### Iteration needed

`SectionBackground.tsx` initially rendered `theme.colors.surface` text in `OfferStrip` unconditionally (white on white when no background was configured). Fixed by adding `useOfferTextColor()` which reads `section.background.mode` and the token name to pick `textPrimary` vs `surface`.

### Rejected suggestion

The AI initially proposed using `Animated.FlatList` with `getItemLayout` for the section list. Rejected: sections have variable heights (HeroBanner vs OfferStrip are very different) and implementing correct `getItemLayout` for heterogeneous content is error-prone. `FlatList` without `getItemLayout` scrolls correctly and section counts are small enough that recycling overhead is irrelevant.

---

## Session 2 — Gesture-driven Booking Flow

### Prompt (paraphrased)

> Implement BookingSheet using @gorhom/bottom-sheet v5 BottomSheetModal. DateStrip (14-day horizontal picker). SlotGrid (morning/evening groups, Taken/Skipped chips). useSlots React Query. useBookSlot with optimistic update + 409 rollback + Alert. SuccessAnimation using Reanimated (no Lottie). ErrorState and EmptyState shared components. Wire app/doctor/[id].tsx.

### What the AI produced

- `useBookSlot` mutation with `onMutate` (cancel in-flight queries → snapshot → optimistic `setQueryData`) → `onError` (rollback + conditional Alert with `SlotConflictError` vs generic error) → `onSuccess` (invalidate). This is the exact React Query optimistic pattern from the docs.
- `SuccessAnimation` initially used `react-native-svg` for the checkmark circle. Caught during TypeScript verification: `react-native-svg` is not in `package.json`. Replaced with two `View` rectangles rotated/positioned to form a ✓ mark using `StyleSheet` — zero new dependencies, purely Reanimated.
- `app/_layout.tsx` updated to add `GestureHandlerRootView` (outermost) and `BottomSheetModalProvider` — both required by `@gorhom/bottom-sheet` v5.

### Iteration needed

`DoctorCarousel`'s `router.push(\`/doctor/${doctor.id}\`)`caused a TypeScript error because`.expo/types/router.d.ts`was stale (generated before`app/doctor/[id].tsx`existed). Fixed by running`expo start`to regenerate the typed routes file, which added`/doctor/[id]`to the`Href` union. The cast was then removed entirely.

### Rejected suggestion

The AI suggested using `@shopify/flash-list` for the slot grid. Rejected: slot grids have at most 8 items (fixed by the mock DB's `SLOT_TEMPLATES`). The FlashList virtualisation overhead is not justified for static, small lists. Used `View` + `flexWrap` instead — simpler, no ref or `estimatedItemSize` API to manage.

---

## Session 3 — Prescriptions List and Dose Tracking

### Prompt (paraphrased)

> Implement PrescriptionsList (FlashList, React Query, skeleton, empty/error). PrescriptionDetailScreen (hero header, diagnosis card, DoseSchedule, MedicineCard list). DoseSchedule with morning/afternoon/night groups and Taken/Skipped chips. useDoseTracker persisting to AsyncStorage.

### What the AI produced

- `useDoseTracker` using a flat `Record<string, boolean>` map keyed by composite strings (`{prescriptionId}:{medicineId}:{date}:{timing}`). The map is loaded from AsyncStorage once on mount, kept in `useState` for synchronous reads, and written back fire-and-forget on every toggle — so the UI never blocks on storage I/O.
- The toggle cycle is `pending → taken → skipped → pending`. "Pending" means the key is absent (not `false`) so the map stays compact — a prescription with 12 medicines × 3 timings × 30 days would have at most 1,080 entries total, trivially small for AsyncStorage.
- `DoseSchedule` passes `getStatus` and `toggle` as props rather than calling `useDoseTracker` internally. This keeps `useDoseTracker` instantiated once in `PrescriptionDetailScreen` so the entire day's state is driven by a single store reference.

### Iteration needed

`FlashList` v2.0.2 (installed) removed the `estimatedItemSize` prop that existed in v1. The AI initially included it; TypeScript caught the error. Removed the prop — the list renders correctly in v2 without it.

### Rejected suggestion

The AI suggested using `zustand` to store dose state globally so it could be read from a home-screen widget or notification handler. Rejected for scope reasons: AsyncStorage already provides cross-session persistence; adding a global Zustand store would duplicate the source of truth and require synchronisation logic. Zustand remains available for a future enhancement.

---

## Session 4 — Dev Panel, Offline Resilience, Bonus Features

### Prompt (paraphrased)

> Implement DevPanel accessible from Profile: latency presets, force-failure toggle, festival theme switcher — all taking effect instantly without reload. Offline cache in src/core/config/cache.ts. Extend useHaptics with themeSwitchFeedback and doseToggleFeedback. i18n utility for en/hi/te. Local notifications helper for daily dose reminders.

### What the AI produced

- `DevPanel` writes to `devSettings` singleton directly (takes effect on next API call) **and** calls `useQueryClient().invalidateQueries(["config"])` immediately — so the HomeScreen refetches with the new `isFestivalTheme` query key within the same user gesture.
- Festival theme toggle also calls `updateThemeTokens()` directly with the hardcoded festival palette so every `useTheme()` consumer re-renders in the same React batch as the toggle, giving frame-synchronous colour change without waiting for the query round-trip.
- `useLayoutConfig` wrapped in try/catch: success path writes to AsyncStorage cache; failure path reads cache and returns it silently — React Query sees a successful response and the UI renders normally with stale data. Only re-throws when cache is also empty (true first-launch + offline scenario).
- `useDoseReminders` uses `Notifications.SchedulableTriggerInputTypes.DAILY` with fixed hours (08:00 morning, 13:00 afternoon, 21:00 night). Each notification has a deterministic `identifier` (`dose:{prescriptionId}:{medicineId}:{timing}`) so rescheduling is idempotent — calling `scheduleRemindersForPrescription` twice doesn't double-register.

### Iteration needed

`expo-notifications` and `expo-localization` were not in `package.json` — installed via `npx expo install` before implementation. The AI correctly identified this gap in its context-gathering phase.

### Rejected suggestion

The AI proposed persisting `devSettings` to AsyncStorage so panel state survives app restarts. Rejected: developer overrides surviving a cold start is actively harmful in production builds (an engineer could accidentally ship with `forceFailure: true`). The in-memory-only singleton is the correct behaviour — settings reset to safe defaults on every launch.

---

## Session 5 — Unit Tests

### Prompt (paraphrased)

> Jest configuration, configValidation.test.ts (Zod schema), sectionRenderer.test.ts (registry + null-guard), bookingFlow.test.ts (optimistic update + 409 rollback). All tests must pass via npm test.

### Iteration 1 — Reanimated mock crash

Initial `jest.setup.js` used `require("react-native-reanimated").setUpTests?.()` followed by a second `jest.mock("react-native-reanimated", ...)` block that `require`d `react-native-reanimated/mock`. The second require loaded `react-native-worklets` native code, crashing with `Cannot read properties of undefined (reading 'loadUnpackers')`. Fix: mocked `react-native-worklets` first (before reanimated loads), then replaced the double-mock with a single clean hand-written mock of the exact APIs used in the source. No `require("react-native-reanimated/mock")` call anywhere.

### Iteration 2 — MockDB singleton leaking state

`bookingFlow.test.ts` tests that check `available: true` were failing because the `db` singleton's `bookedSlotIds` Set persisted across tests in the same file. A booking in one test contaminated the next. Fix: added `resetBookings()` method to `MockDB` and called `db.resetBookings()` in `beforeEach`. This is a standard pattern — test-helper methods on singletons — that doesn't pollute production behaviour.

### Iteration 3 — React Query v5 `setQueryData(key, undefined)`

A test asserted that `setQueryData(key, undefined)` then `getQueryData(key)` returns `undefined` — modelling rollback to "no cache". In React Query v5 this is not the correct API: setting to `undefined` doesn't necessarily clear the entry. The test was updated to use `qc.removeQueries({ queryKey })` which is the v5-correct way to remove a cache entry, followed by asserting `getQueryData` returns `undefined`.

### Rejected suggestion

The AI initially suggested using `@testing-library/react-native`'s `renderHook` to test `useBookSlot` directly. Rejected: `useBookSlot` is a thin wrapper over `useMutation` — rendering it requires full `QueryClientProvider` + mocked `Alert` + mocked `apiClient`, adding significant test complexity for logic that is trivially exercised by testing `apiClient` and `QueryClient` directly. The mutation's optimistic/rollback behaviour is tested at the QueryClient level without any React rendering.

---

## Key architectural decisions driven by AI feedback

| Decision                                            | Alternative considered              | Reason for choice                                                                                                                                            |
| --------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Section registry as `Record<string, ComponentType>` | Switch statement in SectionRenderer | Registry is open for extension without touching SectionRenderer; unknown types handled by absence rather than default case                                   |
| `devSettings` as mutable class singleton            | React context / Zustand store       | Must be readable from `apiClient` (non-React code); class singleton is the only pattern that works both inside and outside the React tree                    |
| `HomeSkeleton` accepts `sectionTypes[]` prop        | Fixed skeleton layout               | Allows the skeleton to match the actual remote config layout, reducing visual pop-in when data arrives                                                       |
| `parseLayoutConfig` falls back rather than throwing | Throw and show error screen         | Remote config errors are silent from the user's perspective; the app stays usable on any malformed payload                                                   |
| Dose map stored as flat `Record<string, boolean>`   | `Array<DoseRecord>`                 | O(1) reads for `getStatus()` calls (called on every render of every chip); array would require O(n) `.find()`                                                |
| Notifications use deterministic identifiers         | Auto-generated IDs                  | Idempotent scheduling — calling `scheduleRemindersForPrescription` multiple times (e.g. re-opening the detail screen) does not stack duplicate notifications |
