/**
 * MobileJoystick
 * 모바일 가상 조이스틱 UI — 이동 방향 시각 피드백
 * Canvas 외부 HTML 오버레이로 렌더링된다
 */

import { useEffect, useRef } from "react";
import "./MobileJoystick.css";

const JOYSTICK_RADIUS = 52;

export default function MobileJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  /** 조이스틱 중심 좌표 */
  const center = useRef<{ x: number; y: number } | null>(null);
  const touchId = useRef<number | null>(null);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        const isLeft = t.clientX < window.innerWidth * 0.42;
        const isBottom = t.clientY > window.innerHeight * 0.5;
        if (isLeft && isBottom && touchId.current === null) {
          touchId.current = t.identifier;
          center.current = { x: t.clientX, y: t.clientY };
          // 조이스틱 베이스 위치 갱신
          if (baseRef.current) {
            baseRef.current.style.left = `${t.clientX - JOYSTICK_RADIUS}px`;
            baseRef.current.style.top = `${t.clientY - JOYSTICK_RADIUS}px`;
            baseRef.current.style.opacity = "1";
          }
          if (knobRef.current) {
            knobRef.current.style.transform = "translate(-50%, -50%)";
          }
        }
      });
    };

    const onMove = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        if (t.identifier !== touchId.current || !center.current) return;
        const dx = t.clientX - center.current.x;
        const dy = t.clientY - center.current.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(len, JOYSTICK_RADIUS * 0.65);
        const nx = len > 0 ? (dx / len) * clamped : 0;
        const ny = len > 0 ? (dy / len) * clamped : 0;
        if (knobRef.current) {
          knobRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
        }
      });
    };

    const onEnd = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        if (t.identifier !== touchId.current) return;
        touchId.current = null;
        center.current = null;
        if (baseRef.current) baseRef.current.style.opacity = "0";
        if (knobRef.current) {
          knobRef.current.style.transform = "translate(-50%, -50%)";
        }
      });
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <div
      ref={baseRef}
      className="joystick-base"
      aria-hidden="true"
    >
      <div ref={knobRef} className="joystick-knob" />
    </div>
  );
}
