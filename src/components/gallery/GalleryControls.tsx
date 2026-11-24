/**
 * GalleryControls
 * 1인칭 갤러리 이동 컨트롤
 * - 마우스 클릭으로 포인터 락 진입
 * - WASD / 방향키로 이동
 * - 경계 충돌 처리 (방 밖으로 나가지 않음)
 */

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { MOVE_BOUNDS } from "./constants";

const MOVE_SPEED = 4.5; // 이동 속도 (units/sec)
const EYE_HEIGHT = 1.7; // 눈 높이 (m)

interface Props {
  /** 포인터 락 상태 변경 콜백 */
  onLockChange: (locked: boolean) => void;
}

export default function GalleryControls({ onLockChange }: Props) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  // 현재 눌린 키 목록
  const keys = useRef<Record<string, boolean>>({});

  // 키보드 이벤트 등록/해제
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    document.addEventListener("keydown", onDown);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("keydown", onDown);
      document.removeEventListener("keyup", onUp);
    };
  }, []);

  // 포인터 락 상태 변화 감지 → 부모로 전달
  useEffect(() => {
    const handleChange = () => {
      onLockChange(!!document.pointerLockElement);
    };
    document.addEventListener("pointerlockchange", handleChange);
    return () => document.removeEventListener("pointerlockchange", handleChange);
  }, [onLockChange]);

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return;

    // 카메라 전방 벡터 (XZ 평면에 투영)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // 오른쪽 벡터 — forward × up = right (+X 방향)
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    // WASD / 방향키 이동
    if (keys.current["KeyW"] || keys.current["ArrowUp"]) {
      camera.position.addScaledVector(forward, MOVE_SPEED * delta);
    }
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) {
      camera.position.addScaledVector(forward, -MOVE_SPEED * delta);
    }
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) {
      camera.position.addScaledVector(right, -MOVE_SPEED * delta);
    }
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) {
      camera.position.addScaledVector(right, MOVE_SPEED * delta);
    }

    // 경계 처리 — 벽 안쪽으로 제한
    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      MOVE_BOUNDS.minX,
      MOVE_BOUNDS.maxX
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      MOVE_BOUNDS.minZ,
      MOVE_BOUNDS.maxZ
    );
    // 눈 높이 고정 (점프/낙하 없음)
    camera.position.y = EYE_HEIGHT;
  });

  return <PointerLockControls ref={controlsRef} />;
}
