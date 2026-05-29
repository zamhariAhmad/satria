"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  Hand,
  Minus,
  Volume2,
  VolumeOff,
  Vibrate,
  SmartphoneNfc,
} from "lucide-react";
import { useIsMounted } from "@/lib/use-is-mounted";

const STORAGE_KEY_COUNT = "satria-tasbih-count";
const STORAGE_KEY_TARGET = "satria-tasbih-target";
const DEFAULT_TARGET = 0;

const RADIUS = 85;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Singleton AudioContext. Browsers cap the number of AudioContexts per tab
// (Chrome ~6), so creating one per tap silently breaks audio after a few taps.
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedAudioContext) return sharedAudioContext;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    sharedAudioContext = new Ctor();
    return sharedAudioContext;
  } catch {
    return null;
  }
}

function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
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

function triggerVibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export function Tasbih() {
  const mounted = useIsMounted();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [soundOn, setSoundOn] = useState(true);
  const [vibrateOn, setVibrateOn] = useState(true);

  // Load from localStorage after mount (avoid hydration mismatch)
  useEffect(() => {
    const savedCount = localStorage.getItem(STORAGE_KEY_COUNT);
    const savedTarget = localStorage.getItem(STORAGE_KEY_TARGET);
    const t = savedTarget !== null ? Math.max(0, Number(savedTarget)) : DEFAULT_TARGET;
    const c = savedCount ? Math.max(0, Number(savedCount)) : 0;
    setTarget(t);
    setTargetInput(String(t));
    setCount(c);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY_COUNT, String(count));
    localStorage.setItem(STORAGE_KEY_TARGET, String(target));
  }, [count, target, mounted]);

  const hasTarget = target > 0;
  const done = hasTarget && count >= target;
  const progress = hasTarget ? (count / target) * CIRCUMFERENCE : 0;
  const strokeDashoffset = CIRCUMFERENCE - Math.min(progress, CIRCUMFERENCE);

  const handleTap = () => {
    if (done) return;
    let reachedTarget = false;
    setCount((c) => {
      const next = c + 1;
      if (hasTarget && next >= target) reachedTarget = true;
      return next;
    });
    if (soundOn) playClickSound();
    if (vibrateOn) {
      triggerVibrate(reachedTarget ? [100, 50, 100] : 30);
    }
  };

  const handleDecrement = () => {
    if (count <= 0) return;
    setCount((c) => c - 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const applyTarget = (val: string) => {
    const n = Math.max(0, parseInt(val, 10) || 0);
    setTarget(n);
    setTargetInput(String(n));
    setCount(0);
  };

  const percentage = hasTarget ? Math.round((count / target) * 100) : null;

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
            min="0"
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
          {hasTarget ? `dari ${target} · ${percentage}%` : "Tanpa target"}
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
          {/* Progress – only shown when target is set */}
          {hasTarget && (
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
          )}
        </svg>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handleTap();
          }}
          disabled={done}
          aria-label={done ? "Target tercapai" : "Tap untuk zikir"}
          className="absolute flex h-44 w-44 touch-manipulation items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {done ? (
            <span className="text-lg font-extrabold tracking-wide">Selesai</span>
          ) : (
            <Hand className="h-10 w-10" aria-hidden />
          )}
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

      {/* Control buttons — 1 row, 4 columns */}
      <div className="grid w-full grid-cols-4 gap-2">
        {/* Suara */}
        <button
          type="button"
          onClick={() => setSoundOn((v) => !v)}
          aria-label={`Suara ${soundOn ? "On" : "Off"}`}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
            soundOn
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {soundOn ? (
            <Volume2 className="h-5 w-5" aria-hidden />
          ) : (
            <VolumeOff className="h-5 w-5" aria-hidden />
          )}
          {soundOn ? "On" : "Off"}
        </button>

        {/* Getar */}
        <button
          type="button"
          onClick={() => setVibrateOn((v) => !v)}
          aria-label={`Getar ${vibrateOn ? "On" : "Off"}`}
          className={`flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
            vibrateOn
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {vibrateOn ? (
            <Vibrate className="h-5 w-5" aria-hidden />
          ) : (
            <SmartphoneNfc className="h-5 w-5" aria-hidden />
          )}
          {vibrateOn ? "On" : "Off"}
        </button>

        {/* Kurangi hitungan */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={count <= 0}
          aria-label="Kurangi hitungan"
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted px-2 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-5 w-5" aria-hidden />
          Kurangi
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          disabled={count <= 0}
          aria-label="Reset hitungan"
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-destructive/30 bg-destructive/5 px-2 py-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
          Reset
        </button>
      </div>
    </div>
  );
}
