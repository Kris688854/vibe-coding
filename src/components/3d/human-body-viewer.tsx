"use client";

import React, { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type HumanBodyViewerProps = {
  primaryMeshKeys?: string[];
  secondaryMeshKeys?: string[];
  heatmapMeshScores?: Record<string, number>;
  viewerLabel?: string;
};

class ViewerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[520px] items-center justify-center rounded-[28px] border border-white/15 bg-slate-950/70 p-8 text-center text-sm text-slate-200">
          3D 人体模型暂时不可用，当前内容仍可继续浏览。
        </div>
      );
    }

    return this.props.children;
  }
}

function SceneLighting() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.8, 4.8);
    camera.lookAt(0, 0.1, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={1.15} />
      <hemisphereLight intensity={0.55} groundColor="#1e293b" />
      <directionalLight position={[2, 3, 3]} intensity={1.4} />
      <directionalLight
        position={[-2, 2, -2]}
        intensity={0.45}
        color="#93c5fd"
      />
    </>
  );
}

function getHeatColor(intensity: number) {
  const clamped = Math.min(Math.max(intensity, 0), 1);
  const cool = new THREE.Color("#fb923c");
  const hot = new THREE.Color("#dc2626");
  return cool.lerp(hot, clamped);
}

function BodyMesh({
  primaryMeshKeys = [],
  secondaryMeshKeys = [],
  heatmapMeshScores,
}: HumanBodyViewerProps) {
  const { scene } = useGLTF("/bodyMuscles.glb");
  const groupRef = useRef<THREE.Group | null>(null);
  const clonedSceneRef = useRef<THREE.Object3D | null>(null);
  const materialCacheRef = useRef<Map<string, THREE.Material>>(new Map());
  const meshCacheRef = useRef<Map<string, THREE.Mesh>>(new Map());

  if (!clonedSceneRef.current) {
    clonedSceneRef.current = scene.clone(true);
  }

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || !clonedSceneRef.current) {
      return;
    }

    group.position.set(0, 0, 0);
    group.rotation.set(0, 0.08, 0);
    group.scale.setScalar(1);
    group.updateMatrixWorld(true);

    const initialBounds = new THREE.Box3().setFromObject(group);
    const initialSize = initialBounds.getSize(new THREE.Vector3());
    const targetHeight = 2.12;
    const safeHeight = initialSize.y || 1;
    const fittedScale = targetHeight / safeHeight;

    group.scale.setScalar(fittedScale);
    group.updateMatrixWorld(true);

    const scaledBounds = new THREE.Box3().setFromObject(group);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());

    group.position.x -= scaledCenter.x;
    group.position.z -= scaledCenter.z;
    group.position.y -= scaledCenter.y;
    group.updateMatrixWorld(true);

    const centeredBounds = new THREE.Box3().setFromObject(group);
    const desiredBottom = -1.02;
    group.position.y += desiredBottom - centeredBounds.min.y;
    group.updateMatrixWorld(true);
  }, []);

  useEffect(() => {
    const clonedScene = clonedSceneRef.current;
    if (!clonedScene) {
      return;
    }

    if (meshCacheRef.current.size === 0) {
      clonedScene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          meshCacheRef.current.set(node.name, node);
          const originalMaterial = Array.isArray(node.material)
            ? node.material[0]
            : node.material;

          if (originalMaterial) {
            materialCacheRef.current.set(node.name, originalMaterial.clone());
          }
        }
      });
    }

    const hasHeatmap =
      Boolean(heatmapMeshScores) && Object.keys(heatmapMeshScores ?? {}).length > 0;
    const maxHeatScore = hasHeatmap
      ? Math.max(...Object.values(heatmapMeshScores ?? {}), 0)
      : 0;

    meshCacheRef.current.forEach((mesh, meshName) => {
      const originalMaterial = materialCacheRef.current.get(meshName);
      if (!originalMaterial) {
        return;
      }

      const nextMaterial = originalMaterial.clone() as THREE.MeshStandardMaterial;
      nextMaterial.transparent = true;
      nextMaterial.depthWrite = true;

      if (hasHeatmap) {
        const rawScore = heatmapMeshScores?.[meshName] ?? 0;
        const intensity = maxHeatScore > 0 ? rawScore / maxHeatScore : 0;

        if (rawScore > 0) {
          const heatColor = getHeatColor(intensity);
          nextMaterial.color = heatColor;
          nextMaterial.emissive = heatColor.clone();
          nextMaterial.emissiveIntensity = 0.16 + intensity * 0.55;
          nextMaterial.opacity = 0.62 + intensity * 0.32;
        } else {
          nextMaterial.opacity = meshName === "BODY" ? 0.88 : 0.22;
          nextMaterial.emissive = new THREE.Color("#000000");
          nextMaterial.emissiveIntensity = 0;
        }
      } else if (primaryMeshKeys.includes(meshName)) {
        nextMaterial.color = new THREE.Color("#f97316");
        nextMaterial.emissive = new THREE.Color("#fb923c");
        nextMaterial.emissiveIntensity = 0.45;
        nextMaterial.opacity = 1;
      } else if (secondaryMeshKeys.includes(meshName)) {
        nextMaterial.color = new THREE.Color("#fdba74");
        nextMaterial.emissive = new THREE.Color("#fdba74");
        nextMaterial.emissiveIntensity = 0.2;
        nextMaterial.opacity = 0.88;
      } else {
        nextMaterial.opacity = meshName === "BODY" ? 0.92 : 0.42;
        nextMaterial.emissive = new THREE.Color("#000000");
        nextMaterial.emissiveIntensity = 0;
      }

      mesh.material = nextMaterial;
    });

    return () => {
      meshCacheRef.current.forEach((mesh, meshName) => {
        const originalMaterial = materialCacheRef.current.get(meshName);
        if (originalMaterial) {
          mesh.material = originalMaterial.clone();
        }
      });
    };
  }, [heatmapMeshScores, primaryMeshKeys, secondaryMeshKeys]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedSceneRef.current} />
    </group>
  );
}

function ViewerCanvas(props: HumanBodyViewerProps) {
  const hasHeatmap =
    Boolean(props.heatmapMeshScores) &&
    Object.keys(props.heatmapMeshScores ?? {}).length > 0;

  return (
    <div className="relative aspect-[4/3] min-h-[520px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]">
      <Canvas
        className="h-full w-full"
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 4.8], fov: 30, near: 0.1, far: 100 }}
      >
        <Suspense fallback={null}>
          <SceneLighting />
          <BodyMesh {...props} />
          <OrbitControls
            enablePan={false}
            minDistance={3.8}
            maxDistance={6.5}
            target={[0, 0.1, 0]}
          />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-xs text-slate-200 backdrop-blur">
        {hasHeatmap ? (
          <>
            热力范围：浅橙到深红
            <br />
            刺激越高，颜色越深
          </>
        ) : (
          <>
            主肌群：橙色高亮
            <br />
            次肌群：浅橙辅助
          </>
        )}
      </div>
      <div className="pointer-events-none absolute right-4 top-4 max-w-[220px] rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-xs text-slate-300 backdrop-blur">
        {props.viewerLabel ?? (hasHeatmap ? "本周刺激热力图" : "人体肌群模型")}
      </div>
    </div>
  );
}

function HumanBodyViewerComponent(props: HumanBodyViewerProps) {
  return (
    <ViewerErrorBoundary>
      <ViewerCanvas {...props} />
    </ViewerErrorBoundary>
  );
}

export const HumanBodyViewer = dynamic(
  () => Promise.resolve(HumanBodyViewerComponent),
  {
    ssr: false,
  },
);

useGLTF.preload("/bodyMuscles.glb");
