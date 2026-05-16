import { StageColorRole } from "@/types/application";

export type RolePalette = {
  solid: string;
  muted: string;
  dot: string;
  pillBg: string;
  pillFg: string;
};

const PALETTES: Record<StageColorRole, RolePalette> = {
  neutral: {
    solid: "var(--role-neutral)",
    muted: "var(--role-neutral-muted)",
    dot: "rgba(255,255,255,0.55)",
    pillBg: "rgba(255,255,255,0.08)",
    pillFg: "rgba(255,255,255,0.85)",
  },
  active: {
    solid: "var(--role-active)",
    muted: "var(--role-active-muted)",
    dot: "#ffe22f",
    pillBg: "rgba(255,226,47,0.14)",
    pillFg: "#ffe96b",
  },
  win: {
    solid: "var(--role-win)",
    muted: "var(--role-win-muted)",
    dot: "#9ddfb0",
    pillBg: "rgba(157,223,176,0.14)",
    pillFg: "#b9e8c6",
  },
  loss: {
    solid: "var(--role-loss)",
    muted: "var(--role-loss-muted)",
    dot: "#ff7351",
    pillBg: "rgba(255,115,81,0.16)",
    pillFg: "#ff9275",
  },
};

export function rolePalette(role: StageColorRole): RolePalette {
  return PALETTES[role];
}
