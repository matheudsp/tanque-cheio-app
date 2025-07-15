import { ColorTheme, Theme } from "@/types/theme";

export const colors: Record<Theme, Readonly<ColorTheme>> = {
  [Theme.LIGHT]: {
    primary: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
      text: "#FFFFFF",
    },
    secondary: {
      main: "#F97316",
      light: "#FB923C",
      dark: "#EA580C",
      text: "#FFFFFF",
    },
    background: {
      default: "#FDFDFD",
      paper: "#F1F1F1",
      elevated: "#EEEEEE",
    },
    text: {
      primary: "#111827",
      secondary: "#6B7280",
      disabled: "#9CA3AF",
      hint: "#9CA3AF",
    },
    button: {
      primary: "#3B82F6",
      secondary: "#E5E7EB",
      disabled: "#F3F4F6",
      text: "#FFFFFF",
    },
    border: "#E5E7EB",
    divider: "#F3F4F6",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#06B6D4",
    success: "#22C55E",
    action: {
      active: "rgba(59, 130, 246, 0.2)",
      hover: "rgba(59, 130, 246, 0.08)",
      selected: "rgba(59, 130, 246, 0.12)",
      disabled: "rgba(15, 23, 42, 0.1)",
    },
    shadow: "rgba(15, 23, 42, 0.08)",
  },
  [Theme.DARK]: {
    primary: {
      main: "#60A5FA",
      light: "#93C5FD",
      dark: "#3B82F6",
      text: "#FFFFFF",
    },
    secondary: {
      main: "#FB923C",
      light: "#FDBA74",
      dark: "#F97316",
      text: "#FFFFFF",
    },
    background: {
      default: "#1B1B1B",
      paper: "#262626",
      elevated: "#2F2F2F",
    },
    text: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      disabled: "#9CA3AF",
      hint: "#9CA3AF",
    },
    button: {
      primary: "#60A5FA",
      secondary: "#4B5563",
      disabled: "#1F2937",
      text: "#FFFFFF",
    },
    border: "#4B5563",
    divider: "#374151",
    error: "#F87171",
    warning: "#FBBF24",
    info: "#22D3EE",
    success: "#4ADE80",
    action: {
      active: "rgba(96, 165, 250, 0.25)",
      hover: "rgba(96, 165, 250, 0.08)",
      selected: "rgba(96, 165, 250, 0.16)",
      disabled: "rgba(241, 245, 249, 0.15)",
    },
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};

export default colors;
