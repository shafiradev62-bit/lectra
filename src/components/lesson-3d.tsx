/**
 * Production 3D viewer — GLB-only via AR3D pipeline.
 * No dummy procedural geometry. All models are real exported meshes.
 */

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Float,
  useGLTF,
  Center,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

export interface ShapeSpec {
  type: "replicate";
  color: string;
  scale: number;
  detail: number;
  label: string;
  modelUrl?: string;
  vertexCount?: number;
  faceCount?: number;
  modelSource?: string;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-ink/70">Generating 3D…</span>
      </div>
    </Html>
  );
}

function GLBModel({ url, scale, color }: { url: string; scale: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.color) mat.color.lerp(new THREE.Color(color), 0.15);
        }
      }
    });
  }, [scene, color]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.25 * delta;
    }
  });

  return (
    <group ref={groupRef} scale={scale * 0.55}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  );
}

function ModelScene({ spec }: { spec: ShapeSpec }) {
  if (!spec.modelUrl) {
    return (
      <mesh>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <GLBModel url={spec.modelUrl} scale={spec.scale} color={spec.color} />
      </Float>
    </Suspense>
  );
}

class ThreeErrorBoundary extends React.Component<
  { children: React.ReactNode; label: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; label: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-sun/20 rounded-2xl">
          <div className="text-center px-4">
            <p className="text-ink font-semibold">{this.props.label}</p>
            <p className="text-ink/60 text-sm mt-1">Reload to retry 3D model</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Lesson3D({ spec }: { spec: ShapeSpec }) {
  return (
    <div className="w-full aspect-square min-h-[280px]">
      <ThreeErrorBoundary label={spec.label}>
        <Canvas shadows className="w-full h-full" gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0.5, 4.2]} fov={42} />
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            autoRotate={!spec.modelUrl}
            autoRotateSpeed={0.8}
          />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} />
          <Environment preset="city" />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={8} blur={2.5} />
          <ModelScene spec={spec} />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}

/** Vertex count from pipeline metadata (not procedural estimate) */
export function vertexCount(spec: ShapeSpec): number {
  if (spec.vertexCount && spec.vertexCount > 0) return spec.vertexCount;
  return 0;
}

/** Download actual GLB from pipeline */
export function downloadGlb(spec: ShapeSpec, name: string): void {
  if (!spec.modelUrl) return;
  const a = document.createElement("a");
  a.href = spec.modelUrl;
  a.download = `lectra-${name.replace(/\s+/g, "-").toLowerCase()}.glb`;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** @deprecated Use downloadGlb — kept for import compat */
export function downloadObj(spec: ShapeSpec, name: string): void {
  downloadGlb(spec, name);
}

/** @deprecated */
export function exportObj(_spec: ShapeSpec, _name: string): string {
  return "";
}

/** @deprecated */
export function buildGeometry(_spec: ShapeSpec): THREE.BufferGeometry {
  return new THREE.BufferGeometry();
}

// Preload helper
export function preloadModel(url: string): void {
  try {
    useGLTF.preload(url);
  } catch {
    // ignore preload errors
  }
}
