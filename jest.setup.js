/**
 * jest.setup.js
 *
 * Runs before every test file. Mocks all native/Expo modules that cannot
 * run in a Node.js environment so pure logic (schema validation, state
 * machines, query-cache operations) can be tested without a device.
 */

// ─── react-native-worklets (loaded transitively by reanimated) ────────────────
// Must be mocked BEFORE reanimated is required, otherwise the native module
// loader crashes with "Cannot read properties of undefined (loadUnpackers)".
jest.mock("react-native-worklets", () => ({
  WorkletsModule: {
    loadUnpackers: jest.fn(),
    makeShareableCloneRecursive: jest.fn((v) => v),
  },
  makeShareableCloneRecursive: jest.fn((v) => v),
  makeWorklet: jest.fn((fn) => fn),
}));

// ─── react-native-reanimated ─────────────────────────────────────────────────
// Use the official mock that ships with the package.  The worklets mock above
// prevents the native crash when this module is required.
jest.mock("react-native-reanimated", () => {
  const mock = {
    useSharedValue: jest.fn((v) => ({ value: v })),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    withTiming: jest.fn((v) => v),
    withSpring: jest.fn((v) => v),
    withRepeat: jest.fn((v) => v),
    withDelay: jest.fn((_, v) => v),
    withSequence: jest.fn((...args) => args[args.length - 1]),
    Easing: {
      out: jest.fn((fn) => fn),
      cubic: jest.fn(),
      linear: jest.fn(),
      bezier: jest.fn(),
    },
    Extrapolation: { CLAMP: "clamp" },
    interpolate: jest.fn((v) => v),
    FadeInDown: {
      delay: jest.fn(() => ({ springify: jest.fn(() => ({})) })),
      duration: jest.fn(() => ({})),
    },
    FadeIn: {
      duration: jest.fn(() => ({})),
    },
    default: {
      View: "Animated.View",
      Text: "Animated.Text",
      FlatList: "Animated.FlatList",
      ScrollView: "Animated.ScrollView",
      createAnimatedComponent: jest.fn((c) => c),
    },
  };
  // Named export "default" must also be the default export for CJS compat
  return { ...mock, __esModule: true, default: mock.default };
});

// ─── AsyncStorage ─────────────────────────────────────────────────────────────
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// ─── expo-haptics ─────────────────────────────────────────────────────────────
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "Light", Medium: "Medium", Heavy: "Heavy" },
  NotificationFeedbackType: {
    Success: "Success",
    Warning: "Warning",
    Error: "Error",
  },
}));

// ─── expo-notifications ───────────────────────────────────────────────────────
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("mock-id")),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" }),
  ),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

// ─── expo-router ──────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
}));

// ─── expo-image ───────────────────────────────────────────────────────────────
jest.mock("expo-image", () => ({ Image: "Image" }));

// ─── expo-linear-gradient ─────────────────────────────────────────────────────
jest.mock("expo-linear-gradient", () => ({ LinearGradient: "LinearGradient" }));

// ─── react-native-safe-area-context ───────────────────────────────────────────
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
  SafeAreaView: "SafeAreaView",
  SafeAreaProvider: ({ children }) => children,
}));

// ─── react-native-gesture-handler ─────────────────────────────────────────────
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: ({ children }) => children,
  Gesture: { Pan: jest.fn(), Tap: jest.fn() },
  GestureDetector: ({ children }) => children,
}));

// ─── @gorhom/bottom-sheet ─────────────────────────────────────────────────────
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetModal: "BottomSheetModal",
  BottomSheetModalProvider: ({ children }) => children,
  BottomSheetScrollView: "BottomSheetScrollView",
  BottomSheetBackdrop: "BottomSheetBackdrop",
}));

// ─── @shopify/flash-list ──────────────────────────────────────────────────────
jest.mock("@shopify/flash-list", () => ({ FlashList: "FlashList" }));

// ─── react-native Alert ───────────────────────────────────────────────────────
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn(),
}));
