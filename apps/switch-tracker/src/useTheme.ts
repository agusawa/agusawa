import { useEffect, useState } from "react";

export type ThemeSetting = "auto" | "light" | "dark";

const STORAGE_KEY = "theme";
const CYCLE: ThemeSetting[] = ["auto", "light", "dark"];

function readStoredTheme(): ThemeSetting {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "auto";
}

function applyResolvedTheme(theme: ThemeSetting) {
  const dark =
    theme === "dark" ||
    (theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme(): { theme: ThemeSetting; cycleTheme: () => void } {
  const [theme, setThemeState] = useState<ThemeSetting>(() => readStoredTheme());

  useEffect(() => {
    applyResolvedTheme(theme);

    if (theme !== "auto") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyResolvedTheme("auto");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  function setTheme(next: ThemeSetting) {
    if (next === "auto") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
    setThemeState(next);
  }

  function cycleTheme() {
    const currentIndex = CYCLE.indexOf(theme);
    const next = CYCLE[(currentIndex + 1) % CYCLE.length];
    setTheme(next);
  }

  return { theme, cycleTheme };
}
