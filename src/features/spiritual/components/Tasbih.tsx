"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/lib/use-is-mounted";

const STORAGE_KEY_COUNT = "satria-tasbih-count";
const STORAGE_KEY_TARGET = "satria-tasbih-target";
const DEFAULT_TARGET = 33;

const RADIUS = 85;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function playClickSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    /* ignore – AudioContext may be blocked */
  }
}

export function Tasbih() {
  const mounted = useIsMounted();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [done, setDone] = useState(false);

  // Load from localStorage after mount (avoid hydration mismatch)
  useEffect(() => {
    const savedCount = localStorage.getItem(STORAGE_KEY_COUNT);
    const savedTarget = localStorage.getItem(STORAGE_KEY_TARGET);
    const t = savedTarget ? Math.max(1, Number(savedTarget)) : DEFAULT_TARGET;
    const c = savedCount ? Math.max(0, Number(savedCount)) : 0;
    setTarget(t);
    setTargetInput(String(t));
    setCount(c);
    if (c >= t) setDone(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY_COUNT, String(count));
    localStorage.setItem(STORAGE_KEY_TARGET, String(target));
  }, [count, target, mounted]);

  const progress = target > 0 ? (count / target) * CIRCUMFERENCE : 0;
  const strokeDashoffset = CIRCUMFERENCE - Math.min(progress, CIRCUMFERENCE);

  const handleTap = () => {
    if (done) return;
    const next = count + 1;
    setCount(next);
    playClickSound();
    if (navigator.vibrate) navigator.vibrate(30);
    if (next >= target) {
      setDone(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
  };

  const handleReset = () => {
    setCount(0);
    setDone(false);
  };

  const applyTarget = (val: string) => {
    const n = Math.max(1, parseInt(val, 10) || DEFAULT_TARGET);
    setTarget(n);
    setTargetInput(String(n));
    setCount(0);
    setDone(false);
  };

  const percentage = target > 0 ? Math.round((count / target) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Target input */}
      <div className="flex w-full items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <label
          htmlFor="tasbih-target"
          className="text-sm font-medium text-muted-foreground"
        >
          Target Zikir
        </label>
        <div className="flex items-center gap-2">
          {[33, 99, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyTarget(String(preset))}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                target === preset
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground hover:bg-accent/50"
              }`}
            >
              {preset}
            </button>
          ))}
          <input
            id="tasbih-target"
            type="number"
            min="1"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            onBlur={(e) => applyTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyTarget(targetInput)}
            className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Counter display */}
      <div className="text-center">
        <p className="text-6xl font-black tabular-nums text-foreground">
          {count}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          dari {target} · {percentage}%
        </p>
      </div>

      {/* Circular progress + tap button */}
      <div className="relative flex h-64 w-64 select-none items-center justify-center">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 256 256"
          aria-hidden
        >
          {/* Track */}
          <circle
            cx="128"
            cy="128"
            r={RADIUS}
            fill="transparent"
            className="stroke-muted"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="128"
            cy="128"
            r={RADIUS}
            fill="transparent"
            className="stroke-primary transition-all duration-150 ease-out"
            strokeWidth="10"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <button
          type="button"
          onClick={handleTap}
          disabled={done}
          aria-label={done ? "Target tercapai" : "Tap untuk zikir"}
          className="absolute flex h-44 w-44 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex flex-col items-center gap-1">
            {done ? (
              <span className="text-lg font-extrabold tracking-wide">Selesai</span>
            ) : (
              <Hand className="h-10 w-10" aria-hidden />
            )}
          </span>
        </button>
      </div>

      {/* Completion message */}
      {done && (
        <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Alhamdulillah, target zikir tercapai!
          </p>
        </div>
      )}

      {/* Reset button */}
      <Button
        variant="outline"
        className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
        onClick={handleReset}
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Reset Hitungan
      </Button>
    </div>
  );
}
