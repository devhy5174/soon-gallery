/**
 * GalleryControls
 * 1인칭 갤러리 컨트롤
 * - WASD / 방향키 이동
 * - 화면 중앙 레이캐스트로 작품 감지
 * - E 키로 작품 감상 모드 진입
 */

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import { MOVE_BOUNDS } from "./constants";

const MOVE_SPEED = 4.5;
const EYE_HEIGHT = 1.7;
/** 작품 상호작용 가능 최대 거리 */
const MAX_INTERACT_DIST = 8;

interface Props {
  onLockChange: (locked: boolean) => void;
  /** 화면 중앙에 작품이 있을 때 해당 artworkId, 없으면 null */
  onLookingAt: (id: string | null) => void;
  /** E 키 눌림 + 작품 조준 시 호출 */
  onInteract: (artworkId: string) => void;
}

export default function GalleryControls({
  onLockChange,
  onLookingAt,
  onInteract,
}: Props) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const keys = useRef<Record<string, boolean>>({});

  /** 현재 조준 중인 artworkId (useFrame → E키 핸들러에서 접근) */
  const lookingAtRef = useRef<string | null>(null);

  /** 씬 초기화 후 한 번만 작품 메시를 수집 */
  const artworkMeshes = useRef<THREE.Mesh[]>([]);
  const meshScanDone = useRef(false);

  // 키보드 이벤트
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

  // 포인터 락 상태 변화 감지
  useEffect(() => {
    const handleChange = () => onLockChange(!!document.pointerLockElement);
    document.addEventListener("pointerlockchange", handleChange);
    return () => document.removeEventListener("pointerlockchange", handleChange);
  }, [onLockChange]);

  // E 키 — 조준 중인 작품 감상
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE" && lookingAtRef.current) {
        onInteract(lookingAtRef.current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onInteract]);

  useFrame(({ scene, raycaster }) => {
    // 작품 메시 목록 최초 1회 수집 (userData.artworkId 가 있는 평면만)
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

    // 화면 중앙(0,0)에서 레이캐스트
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(artworkMeshes.current);
    const hit = hits.find((h) => h.distance < MAX_INTERACT_DIST);
    const hitId = (hit?.object.userData.artworkId as string) ?? null;

    // 값이 바뀔 때만 콜백 호출 (불필요한 리렌더 방지)
    if (hitId !== lookingAtRef.current) {
      lookingAtRef.current = hitId;
      onLookingAt(hitId);
    }

    // 포인터 락 활성 시에만 이동 처리
    if (!controlsRef.current?.isLocked) return;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    // 오른쪽 벡터 — forward × up = right (+X 방향)
    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (keys.current["KeyW"] || keys.current["ArrowUp"])
      camera.position.addScaledVector(forward, MOVE_SPEED * 0.016);
    if (keys.current["KeyS"] || keys.current["ArrowDown"])
      camera.position.addScaledVector(forward, -MOVE_SPEED * 0.016);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"])
      camera.position.addScaledVector(right, -MOVE_SPEED * 0.016);
    if (keys.current["KeyD"] || keys.current["ArrowRight"])
      camera.position.addScaledVector(right, MOVE_SPEED * 0.016);

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
    camera.position.y = EYE_HEIGHT;
  });

  return <PointerLockControls ref={controlsRef} />;
}
