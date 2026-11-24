/**
 * GalleryControlsMobile
 * 모바일 1인칭 갤러리 컨트롤
 * - 바닥 탭: 해당 위치로 자동 이동
 * - 화면 드래그: 시점 회전
 * - 작품 탭: 작품 모달 오픈
 * - artworkIdx 변경: 해당 작품 뷰포인트로 부드럽게 이동
 */

import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MOVE_BOUNDS, DOOR_ZONE, CAMERA_INITIAL } from "./constants";
import { VIEWPOINTS } from "./viewpoints";

const WALK_SPEED = 2.5;
const EYE_HEIGHT = 1.7;
const MAX_INTERACT_DIST = 8;
const TAP_MAX_MOVE = 12;
const TAP_MAX_DURATION = 300;

interface Props {
  onInteract: (artworkId: string) => void;
  onEnterMediaRoom: () => void;
  onNearDoor: (near: boolean) => void;
  artworkIdx: number;
}

export default function GalleryControlsMobile({
  onInteract,
  onEnterMediaRoom,
  onNearDoor,
  artworkIdx,
}: Props) {
  const { camera, scene } = useThree();
  const nearDoorRef = useRef(false);

  /** 바닥 탭 목적지 */
  const destinationRef = useRef<THREE.Vector3 | null>(null);
  const targetYawRef = useRef<number | null>(null);

  /** 뷰포인트 애니메이션 — 고정 duration ease-out */
  const vpAnim = useRef<{
    startPos: THREE.Vector3;
    startQuat: THREE.Quaternion;
    targetPos: THREE.Vector3;
    targetQuat: THREE.Quaternion;
    elapsed: number;
    duration: number;
  } | null>(null);

  /** 드래그 시점 */
  const lookPrev = useRef<{ x: number; y: number } | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  /** 카메라 오일러 (YXZ) */
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));

  /** 탭 감지 */
  const tapStart = useRef<{ x: number; y: number; t: number; id: number } | null>(null);

  /** 작품 메시 */
  const artworkMeshes = useRef<THREE.Mesh[]>([]);
  const meshScanDone = useRef(false);

  const sceneRef = useRef(scene);
  useEffect(() => { sceneRef.current = scene; }, [scene]);
  const cameraRef = useRef(camera);
  useEffect(() => { cameraRef.current = camera; }, [camera]);

  // artworkIdx 변경 → 뷰포인트 애니메이션 시작 (초기 마운트 제외)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }

    const cam = cameraRef.current;
    const startPos = cam.position.clone();
    const startQuat = cam.quaternion.clone();

    const makeQuat = (pos: THREE.Vector3, lookAt: THREE.Vector3) => {
      const m = new THREE.Matrix4();
      m.lookAt(pos, lookAt, new THREE.Vector3(0, 1, 0));
      return new THREE.Quaternion().setFromRotationMatrix(m);
    };

    // artworkIdx === -1: 초기 위치로 복귀
    if (artworkIdx === -1) {
      const targetPos = new THREE.Vector3(...CAMERA_INITIAL.position);
      destinationRef.current = null;
      vpAnim.current = {
        startPos, startQuat, targetPos,
        targetQuat: makeQuat(targetPos, new THREE.Vector3(0, 1.7, -1)),
        elapsed: 0, duration: 1.8,
      };
      return;
    }

    const vp = VIEWPOINTS[artworkIdx];
    if (!vp) return;

    const targetPos = new THREE.Vector3(...vp.position);
    destinationRef.current = null;
    targetYawRef.current = null;
    vpAnim.current = {
      startPos, startQuat, targetPos,
      targetQuat: makeQuat(targetPos, new THREE.Vector3(...vp.lookAt)),
      elapsed: 0, duration: 1.8,
    };
  }, [artworkIdx]);

  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      if (nearDoorRef.current) { onEnterMediaRoom(); return; }

      const cam = cameraRef.current;
      const ndcX = (clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(clientY / window.innerHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);

      // 작품 탭
      if (artworkMeshes.current.length > 0) {
        const hits = raycaster.intersectObjects(artworkMeshes.current);
        const hit = hits.find((h) => h.distance < MAX_INTERACT_DIST);
        if (hit?.object.userData.artworkId) {
          onInteract(hit.object.userData.artworkId as string);
          return;
        }
      }

      // 바닥 탭 → 이동 (뷰포인트 애니메이션 취소)
      const allHits = raycaster.intersectObjects(sceneRef.current.children, true);
      const floorHit = allHits.find((h) => Math.abs(h.point.y) < 0.1);
      if (floorHit) {
        vpAnim.current = null;
        const pt = floorHit.point;
        const dest = new THREE.Vector3(
          THREE.MathUtils.clamp(pt.x, MOVE_BOUNDS.minX, MOVE_BOUNDS.maxX),
          EYE_HEIGHT,
          THREE.MathUtils.clamp(pt.z, MOVE_BOUNDS.minZ, MOVE_BOUNDS.maxZ),
        );
        destinationRef.current = dest;
        const dx = dest.x - cam.position.x;
        const dz = dest.z - cam.position.z;
        if (Math.sqrt(dx * dx + dz * dz) > 0.3) {
          targetYawRef.current = Math.atan2(-dx, -dz);
        }
      }
    },
    [onInteract, onEnterMediaRoom],
  );

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        if (lookTouchId.current === null) {
          lookTouchId.current = t.identifier;
          lookPrev.current = { x: t.clientX, y: t.clientY };
          tapStart.current = { x: t.clientX, y: t.clientY, t: Date.now(), id: t.identifier };
          isDraggingRef.current = false;
        }
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach((t) => {
        if (t.identifier !== lookTouchId.current || !lookPrev.current) return;
        const dx = t.clientX - lookPrev.current.x;
        const dy = t.clientY - lookPrev.current.y;

        if (tapStart.current) {
          const tdx = t.clientX - tapStart.current.x;
          const tdy = t.clientY - tapStart.current.y;
          if (Math.sqrt(tdx * tdx + tdy * tdy) > TAP_MAX_MOVE) {
            tapStart.current = null;
            isDraggingRef.current = true;
            // 드래그 시작 시 뷰포인트 애니메이션 취소
            vpAnim.current = null;
          }
        }

        euler.current.y -= dx * 0.004;
        euler.current.x -= dy * 0.004;
        euler.current.x = THREE.MathUtils.clamp(euler.current.x, -Math.PI / 3, Math.PI / 3);
        lookPrev.current = { x: t.clientX, y: t.clientY };
      });
    };

    const onTouchEnd = (e: TouchEvent) => {
      Array.from(e.changedTouches).forEach((t) => {
        if (t.identifier !== lookTouchId.current) return;
        lookTouchId.current = null;
        lookPrev.current = null;
        isDraggingRef.current = false;

        if (tapStart.current && tapStart.current.id === t.identifier) {
          const elapsed = Date.now() - tapStart.current.t;
          const dx = t.clientX - tapStart.current.x;
          const dy = t.clientY - tapStart.current.y;
          if (elapsed < TAP_MAX_DURATION && Math.sqrt(dx * dx + dy * dy) < TAP_MAX_MOVE) {
            handleTap(t.clientX, t.clientY);
          }
          tapStart.current = null;
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
  }, [handleTap]);

  useFrame(({ scene }, delta) => {
    // 작품 메시 수집
    const found: THREE.Mesh[] = [];
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && obj.userData.artworkId) {
        found.push(obj as THREE.Mesh);
      }
    });
    if (found.length !== artworkMeshes.current.length) {
      artworkMeshes.current = found;
      meshScanDone.current = true;
    } else if (!meshScanDone.current && found.length > 0) {
      artworkMeshes.current = found;
      meshScanDone.current = true;
    }

    // ── 뷰포인트 애니메이션 — ease-out cubic, 고정 duration ──
    // [디버깅 기록]
    // lerp/slerp 방식은 점근적으로 목표에 접근하므로 임계값 도달 시
    // camera.quaternion → euler → setFromEuler 변환에서 미세한 불일치가 발생,
    // 이것이 애니메이션 완료 직전 화면이 살짝 튀는 현상의 원인.
    // 해결: 고정 duration(t: 0→1)으로 정확히 완주하는 ease-out 방식 사용.
    // t=1 도달 시 카메라가 이미 정확한 위치이므로 스냅 불필요.
    if (vpAnim.current) {
      vpAnim.current.elapsed += delta;
      const t = Math.min(vpAnim.current.elapsed / vpAnim.current.duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

      camera.position.lerpVectors(vpAnim.current.startPos, vpAnim.current.targetPos, ease);
      camera.quaternion.slerpQuaternions(vpAnim.current.startQuat, vpAnim.current.targetQuat, ease);
      euler.current.setFromQuaternion(camera.quaternion, "YXZ");

      if (t >= 1) {
        vpAnim.current = null;
      }
      camera.position.y = EYE_HEIGHT;

      // 문 근접 감지
      const near =
        camera.position.x < DOOR_ZONE.triggerX &&
        camera.position.z > DOOR_ZONE.triggerZMin &&
        camera.position.z < DOOR_ZONE.triggerZMax;
      if (near !== nearDoorRef.current) { nearDoorRef.current = near; onNearDoor(near); }
      return;
    }

    // ── 바닥 탭 이동 ──────────────────────────────────────
    if (destinationRef.current) {
      const dest = destinationRef.current;
      const dx = dest.x - camera.position.x;
      const dz = dest.z - camera.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.12) {
        destinationRef.current = null;
        targetYawRef.current = null;
      } else {
        const step = Math.min(WALK_SPEED * delta, dist);
        camera.position.x = THREE.MathUtils.clamp(
          camera.position.x + (dx / dist) * step, MOVE_BOUNDS.minX, MOVE_BOUNDS.maxX,
        );
        camera.position.z = THREE.MathUtils.clamp(
          camera.position.z + (dz / dist) * step, MOVE_BOUNDS.minZ, MOVE_BOUNDS.maxZ,
        );

        if (!isDraggingRef.current && targetYawRef.current !== null) {
          let diff = targetYawRef.current - euler.current.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          euler.current.y += diff * Math.min(delta * 5, 1);
        }
      }
    }

    camera.quaternion.setFromEuler(euler.current);
    camera.position.y = EYE_HEIGHT;

    // 문 근접 감지
    const near =
      camera.position.x < DOOR_ZONE.triggerX &&
      camera.position.z > DOOR_ZONE.triggerZMin &&
      camera.position.z < DOOR_ZONE.triggerZMax;
    if (near !== nearDoorRef.current) { nearDoorRef.current = near; onNearDoor(near); }
  });

  return null;
}
