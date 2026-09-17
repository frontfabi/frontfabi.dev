"use client";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { copy, type Locale } from "@/lib/site";
import { constrainWindow, type WindowBox as Box } from "./geometry";

export default function Window({
  title,
  children,
  locale,
  onClose,
  kind = "main",
  minimized = false,
  onMinimize,
  order = 1,
  onFocus,
  reset = 0,
}: {
  title: string;
  children: ReactNode;
  locale: Locale;
  onClose: () => void;
  kind?: string;
  minimized?: boolean;
  onMinimize?: () => void;
  order?: number;
  onFocus?: () => void;
  reset?: number;
}) {
  const t = copy[locale];
  const ref = useRef<HTMLElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [maximized, setMaximized] = useState(false);
  const drag = useRef<{
    mode: "move" | "resize";
    x: number;
    y: number;
    box: Box;
  } | null>(null);
  const constrain = (b: Box): Box => {
    return constrainWindow(b, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    const fit = () => setBox((b) => (b ? constrain(b) : b));
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  // Remounting via reset restores the initial arrangement without changing content.
  const rect = () => {
    const r = ref.current!.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  };
  const start = (
    event: React.PointerEvent<HTMLElement>,
    mode: "move" | "resize",
  ) => {
    if (
      window.innerWidth <= 700 ||
      maximized ||
      (event.target as HTMLElement).closest("button,a")
    )
      return;
    event.preventDefault();
    onFocus?.();
    drag.current = { mode, x: event.clientX, y: event.clientY, box: rect() };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = event.clientX - d.x,
      dy = event.clientY - d.y;
    setBox(
      constrain(
        d.mode === "move"
          ? { ...d.box, x: d.box.x + dx, y: d.box.y + dy }
          : { ...d.box, width: d.box.width + dx, height: d.box.height + dy },
      ),
    );
  };
  const style: CSSProperties = {
    zIndex: order,
    ...(box && !maximized
      ? { left: box.x, top: box.y, width: box.width, height: box.height }
      : {}),
  };
  return (
    <section
      ref={ref}
      className={`os-window ${kind} ${maximized ? "maximized" : ""}`}
      style={style}
      hidden={minimized}
      aria-label={title}
      onPointerDown={onFocus}
      onFocusCapture={onFocus}
      data-arrangement={reset}
    >
      <div
        className="window-title"
        tabIndex={0}
        aria-label={`${title}. ${locale === "pt" ? "Use as setas para mover; Shift e setas para redimensionar." : "Use arrow keys to move; Shift and arrows to resize."}`}
        onKeyDown={(event) => {
          if (
            !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
              event.key,
            ) ||
            event.target !== event.currentTarget ||
            maximized ||
            window.innerWidth <= 700
          )
            return;
          event.preventDefault();
          const b = box || rect();
          const dx =
            event.key === "ArrowLeft"
              ? -20
              : event.key === "ArrowRight"
                ? 20
                : 0;
          const dy =
            event.key === "ArrowUp" ? -20 : event.key === "ArrowDown" ? 20 : 0;
          setBox(
            constrain(
              event.shiftKey
                ? { ...b, width: b.width + dx, height: b.height + dy }
                : { ...b, x: b.x + dx, y: b.y + dy },
            ),
          );
        }}
        onPointerDown={(event) => start(event, "move")}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button"))
            setMaximized(!maximized);
        }}
      >
        <button className="close-window" aria-label={t.close} onClick={onClose}>
          ×
        </button>
        <span>{title}</span>
        <div className="window-controls">
          {onMinimize && (
            <button aria-label={t.minimize} onClick={onMinimize}>
              _
            </button>
          )}
          <button
            aria-label={t.maximize}
            aria-pressed={maximized}
            onClick={() => setMaximized(!maximized)}
          >
            □
          </button>
        </div>
      </div>
      <div className="window-content">{children}</div>
      <div
        className="resize-handle"
        aria-hidden="true"
        onPointerDown={(event) => start(event, "resize")}
        onPointerMove={move}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      />
    </section>
  );
}
