import { Platform } from "react-native";

/**
 * Inspired by Uber's clean contrast, LinkedIn's professional clarity,
 * and PayPal's trustworthy feel. Optimized for readability and accessibility.
 */
export const Colors = {
  light: {
    // Text - High contrast like Uber/LinkedIn for maximum readability
    text: "#000000", // Pure black for headlines - Uber style
    textSecondary: "#545454", // Darker gray for better readability
    textTertiary: "#767676", // Accessible gray (4.5:1 contrast)
    buttonText: "#FFFFFF",

    // Tab/Navigation
    tabIconDefault: "#8F8F8F",
    tabIconSelected: "#0D7A4F", // Deeper green for better contrast

    // Brand Colors - Refined green palette (growth/generosity)
    link: "#0D7A4F",
    primary: "#0D7A4F", // Richer, more professional green
    primaryLight: "#E6F4ED",
    primaryVariant: "#0A5C3B", // Darker variant for hover states

    // Status Colors - More refined
    urgent: "#C41E3A", // Deeper red, more serious
    urgentLight: "#FDE8EC",
    success: "#0D7A4F",

    // Special States
    anonymous: "#5B2D90", // Deeper purple for distinction
    anonymousLight: "#F3EDFA",
    accent: "#B86E00", // Warmer amber, better contrast
    accentLight: "#FFF4E5",

    // Backgrounds - Clean whites like Uber
    backgroundRoot: "#FFFFFF", // Pure white root - Uber style
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F7F7F7", // Subtle gray - LinkedIn style
    backgroundTertiary: "#EBEBEB",

    // Borders - Subtle but visible
    border: "#E0E0E0",
    borderLight: "#F0F0F0",
    cardShadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    // Text - Cream whites for better eye comfort
    text: "#FFFFFF", // Pure white headlines
    textSecondary: "#B8B8B8",
    textTertiary: "#8A8A8A",
    buttonText: "#FFFFFF",

    // Tab/Navigation
    tabIconDefault: "#6B6B6B",
    tabIconSelected: "#4ADE80",

    // Brand Colors
    link: "#4ADE80",
    primary: "#4ADE80", // Brighter green for dark mode
    primaryLight: "#0F2E1F",
    primaryVariant: "#22C55E",

    // Status Colors
    urgent: "#F87171",
    urgentLight: "#3D1519",
    success: "#4ADE80",

    // Special States
    anonymous: "#C4A7E7",
    anonymousLight: "#2D1F4A",
    accent: "#FBBF24",
    accentLight: "#3D2F0D",

    // Backgrounds - Deep blacks like Uber dark mode
    backgroundRoot: "#000000", // Pure black - Uber style
    backgroundDefault: "#161616",
    backgroundSecondary: "#242424",
    backgroundTertiary: "#363636",

    // Borders
    border: "#363636",
    borderLight: "#242424",
    cardShadow: "rgba(0, 0, 0, 0.5)",
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
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  "2xl": 36,
  "3xl": 44,
  full: 9999,
};

/**
 * Typography system inspired by:
 * - Uber: Bold, high-impact headlines with excellent hierarchy
 * - LinkedIn: Clear, professional body text with good line height
 * - PayPal: Trust-inspiring, readable sizing
 */
export const Typography = {
  // Headlines - Bold and impactful like Uber
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800" as const, // Extra bold for impact
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  // Body - Optimized for readability like LinkedIn
  body: {
    fontSize: 16,
    lineHeight: 26, // Increased line height for better readability
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  // Supporting text
  small: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400" as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500" as const, // Medium weight for better visibility
    letterSpacing: 0.2,
  },
  // Interactive text
  link: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: "600" as const, // Semibold links for clear CTAs
    letterSpacing: 0,
  },
  // Button text - Like PayPal's clear CTAs
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  // Labels
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600" as const,
    letterSpacing: 0.4,
    textTransform: "uppercase" as const,
  },
};

/**
 * Refined shadow system - Subtle like PayPal/LinkedIn
 */
export const Shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardPressed: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fab: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  // New: Modal/overlay shadow
  modal: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
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
