import { Platform } from "react-native";

/**
 * Modern minimal design system — inspired by Arc Browser, Linear, and Notion.
 * Teal-emerald primary for trust and growth. Refined spacing, subtle surfaces.
 */
export const Colors = {
  light: {
    // Text — sharp hierarchy
    text: "#0F172A", // Slate-900: softer than pure black, easier on eyes
    textSecondary: "#475569", // Slate-600: readable, professional
    textTertiary: "#94A3B8", // Slate-400: subtle labels, timestamps
    buttonText: "#FFFFFF",

    // Tab/Navigation
    tabIconDefault: "#94A3B8",
    tabIconSelected: "#0D9488", // Teal-600: fresh, modern

    // Brand — Teal-Emerald gradient feel
    link: "#0D9488",
    primary: "#0D9488", // Teal-600: trust + growth, modern and fresh
    primaryLight: "#F0FDFA", // Teal-50: whisper-light tint
    primaryVariant: "#0F766E", // Teal-700: pressed/hover state

    // Status
    urgent: "#DC2626", // Red-600: clear urgency
    urgentLight: "#FEF2F2",
    success: "#059669", // Emerald-600

    // Special States
    anonymous: "#7C3AED", // Violet-600: distinct, premium feel
    anonymousLight: "#F5F3FF",
    accent: "#D97706", // Amber-600: warm highlights
    accentLight: "#FFFBEB",

    // Backgrounds — layered glass-like surfaces
    backgroundRoot: "#FAFAFA", // Warm off-white, not sterile
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F1F5F9", // Slate-100: subtle depth
    backgroundTertiary: "#E2E8F0", // Slate-200

    // Borders — barely there
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
    cardShadow: "rgba(15, 23, 42, 0.06)",
  },
  dark: {
    // Text — warm whites
    text: "#F8FAFC", // Slate-50
    textSecondary: "#CBD5E1", // Slate-300
    textTertiary: "#64748B", // Slate-500
    buttonText: "#FFFFFF",

    // Tab/Navigation
    tabIconDefault: "#475569",
    tabIconSelected: "#2DD4BF", // Teal-400: vibrant in dark

    // Brand
    link: "#2DD4BF",
    primary: "#2DD4BF", // Teal-400: luminous in dark mode
    primaryLight: "#042F2E", // Teal-950: deep tint
    primaryVariant: "#14B8A6", // Teal-500

    // Status
    urgent: "#EF4444",
    urgentLight: "#2D1519",
    success: "#34D399",

    // Special States
    anonymous: "#A78BFA", // Violet-400
    anonymousLight: "#1E1533",
    accent: "#FBBF24",
    accentLight: "#2D2408",

    // Backgrounds — rich dark layers
    backgroundRoot: "#0C0C0C", // Almost black, not pure
    backgroundDefault: "#141414",
    backgroundSecondary: "#1E1E1E",
    backgroundTertiary: "#2A2A2A",

    // Borders
    border: "#2A2A2A",
    borderLight: "#1E1E1E",
    cardShadow: "rgba(0, 0, 0, 0.4)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  "2xl": 36,
  "3xl": 44,
  full: 9999,
};

/**
 * Typography — tight headlines, comfortable body. Inspired by Linear & Arc.
 */
export const Typography = {
  h1: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800" as const,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400" as const,
    letterSpacing: 0,
  },
  // Supporting text
  small: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400" as const,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.3,
  },
  // Interactive text
  link: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  // Button text
  button: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  // Labels
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600" as const,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
};

/**
 * Shadows — soft, layered depth. More diffuse for modern feel.
 */
export const Shadows = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHover: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardPressed: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0,
  },
  fab: {
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0,
  },
  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
};

/**
 * Font families - System fonts for best native feel
 * Uber uses Uber Move, LinkedIn uses system, PayPal uses PayPal Sans
 * We use system fonts for consistency and performance
 */
export const Fonts = Platform.select({
  ios: {
    sans: "System",
    sansBold: "System",
    serif: "Georgia",
    rounded: "System",
    mono: "Menlo",
  },
  default: {
    sans: "normal",
    sansBold: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    sansBold:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', Times, serif",
    rounded:
      "ui-rounded, 'SF Pro Rounded', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
