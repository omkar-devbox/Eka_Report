import { useState, useEffect, useRef, useCallback } from "react";

interface UseTimerOptions {
  duration: number;
  onExpire: () => void;
  isPaused?: boolean;
  onProgress?: (progress: number) => void;
}

export function useTimer({ duration, onExpire, isPaused: initialPaused = false }: UseTimerOptions) {
  const [isPaused, setIsPaused] = useState(initialPaused);
  const remainingTime = useRef<number>(duration);
  const startTime = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    startTime.current = Date.now();
    timerRef.current = setTimeout(onExpire, remainingTime.current);
  }, [clearTimer, onExpire]);

  const pause = useCallback(() => {
    if (timerRef.current && startTime.current !== null) {
      clearTimer();
      const elapsed = Date.now() - startTime.current;
      remainingTime.current = Math.max(0, remainingTime.current - elapsed);
      startTime.current = null;
      setIsPaused(true);
    }
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (startTime.current === null && remainingTime.current > 0) {
      start();
      setIsPaused(false);
    }
  }, [start]);

  useEffect(() => {
    if (!initialPaused) {
      start();
    }
    return clearTimer;
  }, [start, clearTimer, initialPaused]);

  return {
    isPaused,
    pause,
    resume,
  };
}
