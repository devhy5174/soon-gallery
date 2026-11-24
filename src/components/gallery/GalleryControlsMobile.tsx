/**
 * GalleryControlsMobile
 * 모바일 1인칭 갤러리 컨트롤
 * - 왼쪽 하단 가상 조이스틱: 이동
 * - 오른쪽 화면 드래그: 시점 회전
 * - 작품 탭 (짧은 터치): 작품 모달 오픈
 */

import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MOVE_BOUNDS, DOOR_ZONE } from "./constants";

const MOVE_SPEED = 4.5;
const EYE_HEIGHT = 1.7;
const MAX_INTERACT_DIST = 8;
/** 조이스틱 반지름 (px) */
const JOYSTICK_RADIUS = 52;
/** 탭으로 판정하는 최대 이동 거리 (px) */
const TAP_MAX_MOVE = 10;
/** 탭으로 판정하는 최대 시간 (ms) */
const TAP_MAX_DURATION = 250;

interface Props {
  onInteract: (artworkId: string) => void;
  onEnterMediaRoom: () => void;
  onNearDoor: (near: boolean) => void;
}

export default function GalleryControlsMobile({ onInteract, onEnterMediaRoom, onNearDoor }: Props) {
  const { camera } = useThree();
  const nearDoorRef = useRef(false);

  /** 조이스틱 중심 위치 (고정) */
  const joystickCenter = useRef<{ x: number; y: number } | null>(null);
  /** 조이스틱 현재 방향 벡터 (-1 ~ 1) */
  const joystickDir = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  /** 조이스틱 터치 ID */
  const joystickTouchId = useRef<number | null>(null);

  /** 시점 드래그 이전 위치 */
  const lookPrev = useRef<{ x: number; y: number } | null>(null);
  /** 시점 드래그 터치 ID */
  const lookTouchId = useRef<number | null>(null);
  /** 카메라 오일러 각도 (yaw, pitch) */
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  /** 탭 감지용: 시작 위치/시간 */
  const tapStart = useRef<{ x: number; y: number; t: number; id: number } | null>(null);

  /** 레이캐스트용 작품 메시 목록 */
  const artworkMeshes = useRef<THREE.Mesh[]>([]);
  const meshScanDone = useRef(false);

  /** 조이스틱 영역 여부 — 화면 왼쪽 하단 1/3 */
  const isJoystickZone = useCallback((x: number, y: number) => {
    return x < window.innerWidth * 0.42 && y > window.innerHeight * 0.5;
  }, []);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        if (joystickTouchId.current === null && isJoystickZone(t.clientX, t.clientY)) {
          // 조이스틱 터치 시작
          joystickTouchId.current = t.identifier;
          joystickCenter.current = { x: t.clientX, y: t.clientY };
          joystickDir.current = { x: 0, y: 0 };
        } else if (lookTouchId.current === null) {
          // 시점 드래그 + 탭 감지 터치
          lookTouchId.current = t.identifier;
          lookPrev.current = { x: t.clientX, y: t.clientY };
          tapStart.current = { x: t.clientX, y: t.clientY, t: Date.now(), id: t.identifier };
        }
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach((t) => {
        if (t.identifier === joystickTouchId.current && joystickCenter.current) {
          const dx = t.clientX - joystickCenter.current.x;
          const dy = t.clientY - joystickCenter.current.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const clamped = Math.min(len, JOYSTICK_RADIUS);
          joystickDir.current = {
            x: (dx / len) * (clamped / JOYSTICK_RADIUS) || 0,
            y: (dy / len) * (clamped / JOYSTICK_RADIUS) || 0,
          };
        } else if (t.identifier === lookTouchId.current && lookPrev.current) {
          const dx = t.clientX - lookPrev.current.x;
          const dy = t.clientY - lookPrev.current.y;
          // 탭 판정 취소 (충분히 움직였으면 드래그로 간주)
          if (tapStart.current) {
            const totalDx = t.clientX - tapStart.current.x;
            const totalDy = t.clientY - tapStart.current.y;
            if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > TAP_MAX_MOVE) {
              tapStart.current = null;
            }
          }
          // 시점 회전
          euler.current.y -= dx * 0.004;
          euler.current.x -= dy * 0.004;
          euler.current.x = THREE.MathUtils.clamp(euler.current.x, -Math.PI / 3, Math.PI / 3);
          lookPrev.current = { x: t.clientX, y: t.clientY };
        }
      });
    };

    const onTouchEnd = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        if (t.identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          joystickCenter.current = null;
          joystickDir.current = { x: 0, y: 0 };
        } else if (t.identifier === lookTouchId.current) {
          lookTouchId.current = null;
          lookPrev.current = null;

          // 탭 판정 — 짧은 시간 내 최소 이동이면 작품 탭으로 처리
          if (tapStart.current && tapStart.current.id === t.identifier) {
            const elapsed = Date.now() - tapStart.current.t;
            const dx = t.clientX - tapStart.current.x;
            const dy = t.clientY - tapStart.current.y;
            const moved = Math.sqrt(dx * dx + dy * dy);
            if (elapsed < TAP_MAX_DURATION && moved < TAP_MAX_MOVE) {
              handleTap(t.clientX, t.clientY);
            }
            tapStart.current = null;
          }
        }
      });
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [isJoystickZone]);

  /** 탭 위치에서 레이캐스트 → 작품 히트 or 문 근처면 입장 */
  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      // 문 근처에서 탭 → 미디어 룸 입장
      if (nearDoorRef.current) {
        onEnterMediaRoom();
        return;
      }
      if (artworkMeshes.current.length === 0) return;
      const ndcX = (clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(clientY / window.innerHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.intersectObjects(artworkMeshes.current);
      const hit = hits.find((h) => h.distance < MAX_INTERACT_DIST);
      if (hit?.object.userData.artworkId) {
        onInteract(hit.object.userData.artworkId as string);
      }
    },
    [camera, onInteract, onEnterMediaRoom]
  );

  useFrame(({ scene }) => {
    // 작품 메시 1회 수집
    if (!meshScanDone.current) {
      const found: THREE.Mesh[] = [];
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh && obj.userData.artworkId) {
          found.push(obj as THREE.Mesh);
        }
      });
      if (found.length > 0) {
        artworkMeshes.current = found;
        meshScanDone.current = true;
      }
    }

    // 시점 오일러 → 카메라 쿼터니언 적용
    camera.quaternion.setFromEuler(euler.current);

    // 조이스틱 → 이동
    const jx = joystickDir.current.x;
    const jy = joystickDir.current.y;
    if (Math.abs(jx) > 0.05 || Math.abs(jy) > 0.05) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

      const dt = 0.016;
      camera.position.addScaledVector(forward, -jy * MOVE_SPEED * dt);
      camera.position.addScaledVector(right, jx * MOVE_SPEED * dt);
    }

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, MOVE_BOUNDS.minX, MOVE_BOUNDS.maxX);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, MOVE_BOUNDS.minZ, MOVE_BOUNDS.maxZ);
    camera.position.y = EYE_HEIGHT;

    // 문 근접 여부 감지
    const near =
      camera.position.x < DOOR_ZONE.triggerX &&
      camera.position.z > DOOR_ZONE.triggerZMin &&
      camera.position.z < DOOR_ZONE.triggerZMax;
    if (near !== nearDoorRef.current) {
      nearDoorRef.current = near;
      onNearDoor(near);
    }
  });

  return null;
}
