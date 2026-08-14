import { useCallback, useEffect, useRef, useState } from "react";

import { AUTOHIDE_CONTROLS_MS, FORWARD_MS, REWIND_MS } from "../constants";

interface UsePlayerControlsOptions {
  onTogglePlay: () => void;
  onSeekBy: (seconds: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleSettings: () => void;
  onToggleSubtitles: () => void;
}

export interface UsePlayerControlsResult {
  areControlsVisible: boolean;
  isIdle: boolean;
  showControls: () => void;
}

const EVENT_TARGETS = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA"]);

export function usePlayerControls({
  onTogglePlay,
  onSeekBy,
  onToggleMute,
  onToggleFullscreen,
  onToggleSettings,
  onToggleSubtitles,
}: UsePlayerControlsOptions): UsePlayerControlsResult {
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const hideTimerRef = useRef<number | null>(null);
  const mouseDownAtRef = useRef(0);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setAreControlsVisible(false);
      setIsIdle(true);
    }, AUTOHIDE_CONTROLS_MS);
  }, []);

  const showControls = useCallback(() => {
    setAreControlsVisible(true);
    setIsIdle(false);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && EVENT_TARGETS.has(target.tagName)) {
        return;
      }

      switch (event.key) {
        case " ":
        case "k":
          event.preventDefault();
          onTogglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          onSeekBy(-REWIND_MS / 1000);
          break;
        case "ArrowRight":
          event.preventDefault();
          onSeekBy(FORWARD_MS / 1000);
          break;
        case "m":
          onToggleMute();
          break;
        case "f":
          onToggleFullscreen();
          break;
        case "ArrowUp":
          event.preventDefault();
          onToggleSettings();
          break;
        case "c":
          onToggleSubtitles();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onTogglePlay, onSeekBy, onToggleMute, onToggleFullscreen, onToggleSettings, onToggleSubtitles]);

  useEffect(() => {
    const onPointerMove = () => showControls();
    const onPointerDown = (event: PointerEvent) => {
      mouseDownAtRef.current = Date.now();
      mouseDownPosRef.current = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      const start = mouseDownPosRef.current;
      if (!start) return;

      const dx = Math.abs(event.clientX - start.x);
      const dy = Math.abs(event.clientY - start.y);
      const quickTap = Date.now() - mouseDownAtRef.current < 300 && dx < 8 && dy < 8;

      // Only toggle play for taps on the media surface itself; taps on
      // controls, buttons, modals, or the seekbar must never pause playback.
      const target = event.target as HTMLElement | null;
      const isPlayerUi =
        target?.closest("button, input, select, textarea, [role='slider'], [data-player-ui]") ??
        false;

      if (quickTap && !isPlayerUi) {
        onTogglePlay();
      }
      showControls();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onTogglePlay, showControls]);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [scheduleHide]);

  return { areControlsVisible, isIdle, showControls };
}
