import { useEffect, useRef } from "react";
import { Chart } from "chart.js";
import type { ChartConfiguration, ChartType } from "chart.js";
import "../../lib/chartSetup";

type ChartCanvasProps<T extends ChartType> = {
  config: ChartConfiguration<T>;
  ariaLabel: string;
  height?: number;
};

export function ChartCanvas<T extends ChartType>({
  config,
  ariaLabel,
  height = 280,
}: ChartCanvasProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, config);

    // Clean-up: remove the old chart before drawing a new one or leaving the page
    return () => chart.destroy();
  }, [config]);

  return (
    <div style={{ position: "relative", height }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
    </div>
  );
}