import { useEffect, useState } from "react";

export type ChartTheme = {
  text: string;
  muted: string;
  grid: string;
  surface: string;
  primary: string;
  primarySoft: string;
  font: string;
};

function readTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();

  return {
    text: token("--color-text"),
    muted: token("--color-text-muted"),
    grid: token("--color-border"),
    surface: token("--color-surface"),
    primary: token("--color-primary"),
    primarySoft: token("--color-primary-soft"),
    font: token("--font-sans"),
  };
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setTheme(readTheme());
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return theme;
}