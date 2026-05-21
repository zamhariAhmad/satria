"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type AudioPlayerProps = {
  src: string;
  label?: string;
  className?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};

const audioRegistry: { current: HTMLAudioElement | null } = { current: null };

function pauseOthers(except: HTMLAudioElement) {
  if (audioRegistry.current && audioRegistry.current !== except) {
    audioRegistry.current.pause();
  }
  audioRegistry.current = except;
}

export function AudioPlayer({
  src,
  label,
  className,
  variant = "ghost",
  size = "sm",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => {
      pauseOthers(audio);
      setPlaying(true);
      setLoading(false);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onWait = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWait);
    audio.addEventListener("canplay", onCanPlay);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWait);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  // Reset state when source changes
  useEffect(() => {
    setPlaying(false);
    setLoading(false);
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setLoading(true);
      audio.play().catch(() => setLoading(false));
    } else {
      audio.pause();
    }
  };

  const sizeCls =
    size === "sm" ? "h-8 w-8 text-xs" : "h-10 px-3 text-sm gap-2";
  const variantCls =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-muted text-foreground hover:bg-muted/80";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? `Pause ${label ?? "audio"}` : `Play ${label ?? "audio"}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50",
        sizeCls,
        variantCls,
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : playing ? (
        <Pause className="h-4 w-4" aria-hidden />
      ) : (
        <Play className="h-4 w-4" aria-hidden />
      )}
      {size === "md" && label ? <span>{label}</span> : null}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        playsInline
        className="hidden"
      />
    </button>
  );
}
