"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

type Props = {
  startedAt: string;
  timeLimitMinutes: number;
  onTimeout: () => void;
};

export function QuizTimer({ startedAt, timeLimitMinutes, onTimeout }: Props) {
  const endTime = new Date(startedAt).getTime() + timeLimitMinutes * 60 * 1000;
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((endTime - Date.now()) / 1000)),
  );
  const firedRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    function tick() {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        onTimeoutRef.current();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const isLowTime = secondsLeft > 0 && secondsLeft < 60;
  const isOut = secondsLeft === 0;

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-base px-3 py-1.5 font-mono text-sm font-medium",
        isOut
          ? "bg-bg-danger-softer text-text-fg-danger"
          : isLowTime
            ? "bg-bg-warning-softer text-text-fg-warning-strong"
            : "bg-bg-secondary-soft text-text-heading",
      ].join(" ")}
    >
      <Clock className="size-4" aria-hidden />
      {timeStr}
    </div>
  );
}
