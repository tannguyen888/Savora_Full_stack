export type ThemeMode = "light" | "dark";

const PALETTE = {
  light: {
    background: "#fcfaf6",
    foreground: "#3f342c",
    card: "#ffffff",
    primary: "#8d664c",
    primarySoft: "#f2e8df",
    muted: "#efede9",
    mutedForeground: "#8c7d71",
    border: "#e6dfd5",
    accent: "#c8e7cb"
  },
  dark: {
    background: "#0b0a09",
    foreground: "#f6efe8",
    card: "#171412",
    primary: "#d8a47b",
    primarySoft: "#2c221d",
    muted: "#221d19",
    mutedForeground: "#c8b8aa",
    border: "#4b4038",
    accent: "#3f6b49"
  }
} as const;

export const design = {
  color: { ...PALETTE.light },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20
  },
  font: {
    heading: "serif",
    body: "monospace"
  }
};

export function applyTheme(mode: ThemeMode) {
  Object.assign(design.color, PALETTE[mode]);
}
