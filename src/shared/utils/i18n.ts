/**
 * Minimal i18n utility for Tapza Care.
 *
 * Supports three locales: English (en), Hindi (hi), Telugu (te).
 *
 * Usage:
 *   import { t, setLocale, getLocale } from "@/shared/utils/i18n";
 *
 *   t("bookAppointment")          // → "Book Appointment"
 *   setLocale("te");
 *   t("bookAppointment")          // → "అపాయింట్‌మెంట్ బుక్ చేయండి"
 *   t("missing_key")              // → "missing_key"  (safe fallback)
 */

export type Locale = "en" | "hi" | "te";

// ─── String catalogue ─────────────────────────────────────────────────────────

const strings = {
  // ── General ──────────────────────────────────────────────────────────────
  appName: {
    en: "Tapza Care",
    hi: "टपज़ा केयर",
    te: "టప్జా కేర్",
  },
  loading: {
    en: "Loading…",
    hi: "लोड हो रहा है…",
    te: "లోడవుతోంది…",
  },
  retry: {
    en: "Try again",
    hi: "पुनः प्रयास करें",
    te: "మళ్ళీ ప్రయత్నించండి",
  },
  done: {
    en: "Done",
    hi: "हो गया",
    te: "పూర్తయింది",
  },
  cancel: {
    en: "Cancel",
    hi: "रद्द करें",
    te: "రద్దు చేయండి",
  },
  save: {
    en: "Save",
    hi: "सहेजें",
    te: "సేవ్ చేయండి",
  },

  // ── Navigation tabs ───────────────────────────────────────────────────────
  tabHome: {
    en: "Home",
    hi: "होम",
    te: "హోమ్",
  },
  tabBookings: {
    en: "Bookings",
    hi: "बुकिंग",
    te: "బుకింగ్స్",
  },
  tabPrescriptions: {
    en: "Prescriptions",
    hi: "नुस्खे",
    te: "ప్రిస్క్రిప్షన్లు",
  },
  tabProfile: {
    en: "Profile",
    hi: "प्रोफ़ाइल",
    te: "ప్రొఫైల్",
  },

  // ── Home screen ───────────────────────────────────────────────────────────
  greeting: {
    en: "Namaste",
    hi: "नमस्ते",
    te: "నమస్తే",
  },

  // ── Booking ───────────────────────────────────────────────────────────────
  bookAppointment: {
    en: "Book Appointment",
    hi: "अपॉइंटमेंट बुक करें",
    te: "అపాయింట్‌మెంట్ బుక్ చేయండి",
  },
  selectDate: {
    en: "Select Date",
    hi: "तारीख चुनें",
    te: "తేదీ ఎంచుకోండి",
  },
  availableSlots: {
    en: "Available Slots",
    hi: "उपलब्ध स्लॉट",
    te: "అందుబాటులో ఉన్న స్లాట్లు",
  },
  bookingConfirmed: {
    en: "Booking Confirmed!",
    hi: "बुकिंग की पुष्टि हो गई!",
    te: "బుకింగ్ నిర్ధారించబడింది!",
  },
  slotTaken: {
    en: "This slot was just taken. Please pick another time.",
    hi: "यह स्लॉट अभी लिया गया। कृपया दूसरा समय चुनें।",
    te: "ఈ స్లాట్ ఇప్పుడే తీసుకోబడింది. దయచేసి మరో సమయం ఎంచుకోండి.",
  },
  consultationFee: {
    en: "Consultation fee",
    hi: "परामर्श शुल्क",
    te: "సంప్రదింపు రుసుము",
  },
  today: {
    en: "Today",
    hi: "आज",
    te: "ఈరోజు",
  },
  tomorrow: {
    en: "Tomorrow",
    hi: "कल",
    te: "రేపు",
  },

  // ── Prescriptions ─────────────────────────────────────────────────────────
  prescriptions: {
    en: "Prescriptions",
    hi: "नुस्खे",
    te: "ప్రిస్క్రిప్షన్లు",
  },
  diagnosis: {
    en: "Diagnosis",
    hi: "निदान",
    te: "రోగ నిర్ధారణ",
  },
  medicines: {
    en: "Medicines",
    hi: "दवाइयाँ",
    te: "మందులు",
  },
  todaySchedule: {
    en: "Today's Schedule",
    hi: "आज का कार्यक्रम",
    te: "ఈరోజు షెడ్యూల్",
  },

  // ── Dose timing ───────────────────────────────────────────────────────────
  morning: {
    en: "Morning",
    hi: "सुबह",
    te: "ఉదయం",
  },
  afternoon: {
    en: "Afternoon",
    hi: "दोपहर",
    te: "మధ్యాహ్నం",
  },
  night: {
    en: "Night",
    hi: "रात",
    te: "రాత్రి",
  },
  doseTaken: {
    en: "Taken",
    hi: "ले लिया",
    te: "తీసుకున్నారు",
  },
  doseSkipped: {
    en: "Skipped",
    hi: "छोड़ दिया",
    te: "వదిలిపెట్టారు",
  },
  dosePending: {
    en: "Mark taken",
    hi: "लिया बताएं",
    te: "తీసుకున్నట్లు గుర్తించండి",
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  reminderTitle: {
    en: "Medicine reminder",
    hi: "दवाई का समय",
    te: "మందు రిమైండర్",
  },
  reminderBody: {
    en: "Time to take your {medicine}",
    hi: "अपनी {medicine} लेने का समय हो गया",
    te: "మీ {medicine} తీసుకునే సమయం",
  },

  // ── Dev panel ─────────────────────────────────────────────────────────────
  devPanel: {
    en: "Developer Panel",
    hi: "डेवलपर पैनल",
    te: "డెవలపర్ పానెల్",
  },
  networkLatency: {
    en: "Network Latency",
    hi: "नेटवर्क लेटेंसी",
    te: "నెట్‌వర్క్ లేటెన్సీ",
  },
  forceFailure: {
    en: "Force Network Failure",
    hi: "नेटवर्क विफलता दबाएं",
    te: "నెట్‌వర్క్ వైఫల్యాన్ని బలవంతం చేయండి",
  },
  festivalTheme: {
    en: "Festival Theme (Diwali)",
    hi: "फेस्टिवल थीम (दिवाली)",
    te: "పండుగ థీమ్ (దీపావళి)",
  },
  resetSettings: {
    en: "Reset All",
    hi: "सब रीसेट करें",
    te: "అన్నీ రీసెట్ చేయండి",
  },

  // ── Errors / Empty ────────────────────────────────────────────────────────
  errorGeneric: {
    en: "Something went wrong",
    hi: "कुछ गड़बड़ हो गई",
    te: "ఏదో తప్పు జరిగింది",
  },
  errorNetwork: {
    en: "Check your connection and try again.",
    hi: "अपना कनेक्शन जांचें और पुनः प्रयास करें।",
    te: "మీ కనెక్షన్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.",
  },
  emptyPrescriptions: {
    en: "No prescriptions yet",
    hi: "अभी तक कोई नुस्खा नहीं",
    te: "ఇంకా ప్రిస్క్రిప్షన్లు లేవు",
  },
  emptySlots: {
    en: "No slots available",
    hi: "कोई स्लॉट उपलब्ध नहीं",
    te: "స్లాట్లు అందుబాటులో లేవు",
  },
} as const;

export type StringKey = keyof typeof strings;

// ─── Runtime locale state ─────────────────────────────────────────────────────

let currentLocale: Locale = "en";

/** Set the active locale for all subsequent `t()` calls. */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/** Return the currently active locale. */
export function getLocale(): Locale {
  return currentLocale;
}

// ─── Translation function ─────────────────────────────────────────────────────

/**
 * Translate a key into the current locale.
 *
 * Supports simple `{placeholder}` interpolation:
 *   t("reminderBody", { medicine: "Paracetamol" })
 *   // → "Time to take your Paracetamol"
 *
 * Falls back to English if the locale string is missing.
 * Falls back to the key itself if the key is not in the catalogue.
 */
export function t(key: StringKey, params?: Record<string, string>): string {
  const entry = strings[key] as Record<Locale, string> | undefined;
  if (!entry) return key;

  const raw = entry[currentLocale] ?? entry["en"] ?? key;

  if (!params) return raw;

  // Interpolate {placeholder} tokens
  return Object.entries(params).reduce(
    (str, [token, value]) => str.replaceAll(`{${token}}`, value),
    raw,
  );
}

/**
 * Returns a translation function bound to a specific locale — useful for
 * server-side rendering or tests without mutating global state.
 */
export function createTranslator(locale: Locale) {
  return (key: StringKey, params?: Record<string, string>): string => {
    const entry = strings[key] as Record<Locale, string> | undefined;
    if (!entry) return key;
    const raw = entry[locale] ?? entry["en"] ?? key;
    if (!params) return raw;
    return Object.entries(params).reduce(
      (str, [token, value]) => str.replaceAll(`{${token}}`, value),
      raw,
    );
  };
}
