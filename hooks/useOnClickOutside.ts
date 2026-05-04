"use client";

import { useEffect, useRef } from "react";

/** Calls `onOutside` when a pointer event occurs outside `ref`. */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: () => void,
) {
  const saved = useRef(onOutside);
  saved.current = onOutside;

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      saved.current();
    }
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref]);
}
