/**
 * Beautiful 3D viewer — procedural geometry for all shape types
 * + GLB loading when modelUrl is present.
 */

import React, { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Float,
  useGLTF,
  Center,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import type { LessonShape } from "@/lib/lesson-generator";

export type ShapeSpec = LessonShape;

export function vertexCount(spec: LessonShape): number {
  const d = Math.max(0, Math.min(3, spec.detail ?? 1));
  switch (spec.type) {
    case "sphere":       return Math.pow(16 + d * 16, 2) * 6;
    case "cube":         return 24;
    case "torus":        return (16 + d * 8) * (8 + d * 4);
    case "icosahedron":  return [12, 42, 162, 642][d] ?? 12;
    case "dodecahedron": return [20, 80, 320, 1280][d] ?? 20;
    case "cylinder":     return (16 + d * 8) * 2 + 2;
    case "cone":         return 16 + d * 8 + 1;
    case "molecule":     return 24 * 5;
    case "terrain":      return Math.pow(16 + d * 8, 2);
    case "organic":      return Math.pow(32 + d * 16, 2);
    case "star":         return 20 * (d + 1);
    default:             return 0;
  }
}

export function downloadGlb(spec: LessonShape, filename: string) {
  if (spec.modelUrl) {
    const a = document.createElement("a");
    a.href = spec.modelUrl;
    a.download = `${filename.replace(/\s+/g, "-").toLowerCase()}.glb`;
    a.click();
  }
}

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <Html center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "2.5px solid oklch(0.72 0.18 45)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "oklch(0.45 0.02 60)", fontFamily: "monospace" }}>
          Generating 3D…
        </span>
      </div>
    </Html>
  );
}

// ─── Shared material ─────────────────────────────────────────────────────────

function Mat({ color, metalness = 0.2, roughness = 0.35 }: { color: string; metalness?: number; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} envMapIntensity={1} />;
}

// ─── Procedural shapes ───────────────────────────────────────────────────────

function SphereMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => { if (ref.current) { ref.current.rotation.y += 0.4 * dt; ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15; } });
  const s = 16 + detail * 12;
  return <mesh ref={ref} scale={scale * 0.72}><sphereGeometry args={[1, s, s]} /><Mat color={color} metalness={0.18} roughness={0.3} /></mesh>;
}

function CubeMesh({ color, scale }: { color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) { ref.current.rotation.y += 0.35 * dt; ref.current.rotation.x += 0.2 * dt; } });
  return <mesh ref={ref} scale={scale * 0.65}><boxGeometry args={[1.4, 1.4, 1.4]} /><Mat color={color} metalness={0.1} roughness={0.42} /></mesh>;
}

function TorusMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => { if (ref.current) { ref.current.rotation.y += 0.5 * dt; ref.current.rotation.x = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.6) * 0.3; } });
  const s = 20 + detail * 12; const t = 8 + detail * 6;
  return <mesh ref={ref} scale={scale * 0.65}><torusGeometry args={[0.9, 0.38, t, s]} /><Mat color={color} metalness={0.25} roughness={0.22} /></mesh>;
}

function ConeMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += 0.45 * dt; });
  return <mesh ref={ref} scale={scale * 0.65}><coneGeometry args={[0.8, 1.8, 16 + detail * 8]} /><Mat color={color} metalness={0.1} roughness={0.44} /></mesh>;
}

function CylinderMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => { if (ref.current) { ref.current.rotation.y += 0.4 * dt; ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.12; } });
  return <mesh ref={ref} scale={scale * 0.65}><cylinderGeometry args={[0.7, 0.7, 1.6, 16 + detail * 8]} /><Mat color={color} metalness={0.15} roughness={0.35} /></mesh>;
}

function IcoMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) { ref.current.rotation.y += 0.3 * dt; ref.current.rotation.x += 0.15 * dt; } });
  return <mesh ref={ref} scale={scale * 0.72}><icosahedronGeometry args={[1, detail]} /><Mat color={color} metalness={0.3} roughness={0.2} /></mesh>;
}

function DodecaMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) { ref.current.rotation.y += 0.25 * dt; ref.current.rotation.z += 0.1 * dt; } });
  return <mesh ref={ref} scale={scale * 0.68}><dodecahedronGeometry args={[1, detail]} /><Mat color={color} metalness={0.22} roughness={0.28} /></mesh>;
}

function StarMesh({ color, scale }: { color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const outerR = 1, innerR = 0.42, pts = 5;
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      if (i === 0) shape.moveTo(r * Math.cos(angle), r * Math.sin(angle));
      else shape.lineTo(r * Math.cos(angle), r * Math.sin(angle));
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 3 });
  }, []);
  useFrame((state, dt) => { if (ref.current) { ref.current.rotation.z += 0.4 * dt; ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4; } });
  return <mesh ref={ref} geometry={geo} scale={scale * 0.55} position={[0, 0, -0.2]}><Mat color={color} metalness={0.25} roughness={0.28} /></mesh>;
}

function OrganicMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const segs = 24 + detail * 10;
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, segs, segs);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const noise = (Math.sin(x * 2.5) * Math.cos(y * 2) * Math.sin(z * 3)) * 0.22;
      const len = Math.sqrt(x * x + y * y + z * z);
      pos.setXYZ(i, x / len * (1 + noise), y / len * (1 + noise), z / len * (1 + noise));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);
  useFrame((state, dt) => { if (ref.current) { ref.current.rotation.y += 0.3 * dt; ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.25; } });
  return <mesh ref={ref} geometry={geo} scale={scale * 0.7}><Mat color={color} metalness={0.08} roughness={0.55} /></mesh>;
}

function MoleculeMesh({ color, scale }: { color: string; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const atoms: [number, number, number][] = [[0,0,0],[1.1,0.7,0],[-1.1,0.7,0],[0,-1.2,0.4],[0.6,0,1.1]];
  const bondMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d4d4d4", metalness: 0.4, roughness: 0.3 }), []);
  const c = new THREE.Color(color);
  const atomMat = useMemo(() => new THREE.MeshStandardMaterial({ color: c, metalness: 0.2, roughness: 0.32 }), [color]);
  const secMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f5c542", metalness: 0.2, roughness: 0.38 }), []);
  useFrame((state, dt) => { if (groupRef.current) { groupRef.current.rotation.y += 0.4 * dt; groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.28; } });
  return (
    <group ref={groupRef} scale={scale * 0.55}>
      {atoms.map((pos, i) => (
        <mesh key={i} position={pos} material={i === 0 ? atomMat : secMat}>
          <sphereGeometry args={[i === 0 ? 0.45 : 0.3, 16, 16]} />
        </mesh>
      ))}
      {atoms.slice(1).map((pos, i) => {
        const start = new THREE.Vector3(0,0,0);
        const end = new THREE.Vector3(...pos);
        const dir = end.clone().sub(start);
        const len = dir.length();
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const cyl = new THREE.CylinderGeometry(0.07, 0.07, len, 8);
        const m = new THREE.Mesh(cyl, bondMat);
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.normalize());
        return <primitive key={`b${i}`} object={m} />;
      })}
    </group>
  );
}

function TerrainMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const segs = 20 + detail * 8;
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.2, 2.2, segs, segs);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(x*2.4)*0.28 + Math.cos(y*2)*0.22 + Math.sin((x+y)*3.5)*0.12 + Math.cos(x*5+y*2.5)*0.07);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);
  useFrame((state, dt) => { if (ref.current) { ref.current.rotation.z += 0.2 * dt; ref.current.rotation.x = -Math.PI/4 + Math.sin(state.clock.elapsedTime*0.4)*0.14; } });
  return <mesh ref={ref} geometry={geo} scale={scale * 0.8}><Mat color={color} metalness={0.05} roughness={0.65} /></mesh>;
}

// ─── GLB Loader ──────────────────────────────────────────────────────────────

function GLBModel({ url, scale }: { url: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  useEffect(() => {
    scene.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
    });
  }, [scene]);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += 0.3 * dt; });
  return (
    <group ref={ref} scale={scale * 0.55}>
      <Center><primitive object={scene.clone()} /></Center>
    </group>
  );
}

// ─── Scene ───────────────────────────────────────────────────────────────────

const F = { speed: 1.5, rotationIntensity: 0.1, floatIntensity: 0.5 };

function ShapeBody({ spec }: { spec: LessonShape }) {
  const col = /^#[0-9a-fA-F]{6}$/.test(spec.color) ? spec.color : "#f5c542";
  const sc = Math.max(0.5, Math.min(2, spec.scale ?? 1));
  const dt = Math.max(0, Math.min(3, Math.round(spec.detail ?? 1)));

  if (spec.modelUrl) {
    return (
      <Suspense fallback={<Spinner />}>
        <Float {...F}><GLBModel url={spec.modelUrl} scale={sc} /></Float>
      </Suspense>
    );
  }

  switch (spec.type) {
    case "sphere":       return <Float {...F}><SphereMesh color={col} scale={sc} detail={dt} /></Float>;
    case "cube":         return <Float {...F}><CubeMesh color={col} scale={sc} /></Float>;
    case "torus":        return <Float {...F}><TorusMesh color={col} scale={sc} detail={dt} /></Float>;
    case "cone":         return <Float {...F}><ConeMesh color={col} scale={sc} detail={dt} /></Float>;
    case "cylinder":     return <Float {...F}><CylinderMesh color={col} scale={sc} detail={dt} /></Float>;
    case "icosahedron":  return <Float {...F}><IcoMesh color={col} scale={sc} detail={dt} /></Float>;
    case "dodecahedron": return <Float {...F}><DodecaMesh color={col} scale={sc} detail={dt} /></Float>;
    case "star":         return <Float {...F}><StarMesh color={col} scale={sc} /></Float>;
    case "organic":      return <Float {...F}><OrganicMesh color={col} scale={sc} detail={dt} /></Float>;
    case "molecule":     return <Float {...F}><MoleculeMesh color={col} scale={sc} /></Float>;
    case "terrain":      return <Float {...F}><TerrainMesh color={col} scale={sc} detail={dt} /></Float>;
    default:             return <Float {...F}><SphereMesh color={col} scale={sc} detail={dt} /></Float>;
  }
}

// ─── Error Boundary ──────────────────────────────────────────────────────────

class ErrBoundary extends React.Component<
  { children: React.ReactNode; label: string },
  { err: boolean }
> {
  constructor(p: { children: React.ReactNode; label: string }) {
    super(p);
    this.state = { err: false };
  }
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "oklch(0.93 0.02 80)", borderRadius: 16, color: "oklch(0.45 0.02 60)", fontSize: 12 }}>
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🔷</div>
            <p style={{ fontWeight: 600 }}>{this.props.label}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function Lesson3D({ spec }: { spec: LessonShape }) {
  return (
    <ErrBoundary label={spec.label || "3D Model"}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={45} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, -2, -4]} intensity={0.5} color="#88b8e8" />
        <pointLight position={[0, 4, 0]} intensity={0.9} color="#f5c542" />
        <ShapeBody spec={spec} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={5} blur={2.5} far={2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} minPolarAngle={Math.PI/4} maxPolarAngle={3*Math.PI/4} />
      </Canvas>
    </ErrBoundary>
  );
}
