/**
 * lesson-3d.tsx — Premium 3D viewer
 * Physically-based materials, dynamic multi-light rig, animated shapes,
 * wireframe accents, per-shape post-processing feel — all procedural.
 */

import React, { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
  Float,
  useGLTF,
  Center,
  Html,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Sparkles,
  Trail,
  Edges,
} from "@react-three/drei";
import * as THREE from "three";
import type { LessonShape } from "@/lib/lesson-generator";

export type ShapeSpec = LessonShape;

// ─── Vertex count ─────────────────────────────────────────────────────────────

export function vertexCount(spec: LessonShape): number {
  const d = Math.max(0, Math.min(3, spec.detail ?? 1));
  switch (spec.type) {
    case "sphere":       return Math.pow(32 + d * 16, 2);
    case "planet":       return Math.pow(32 + d * 16, 2);
    case "cube":         return 24;
    case "torus":        return (24 + d * 12) * (12 + d * 6);
    case "icosahedron":  return [12, 42, 162, 642][d] ?? 12;
    case "dodecahedron": return [20, 80, 320, 1280][d] ?? 20;
    case "cylinder":     return (24 + d * 8) * 2 + 2;
    case "cone":         return 24 + d * 8 + 1;
    case "molecule":     return 24 * 7;
    case "terrain":      return Math.pow(24 + d * 12, 2);
    case "organic":      return Math.pow(48 + d * 16, 2);
    case "star":         return 20 * (d + 2);
    case "volcano":      return Math.pow(24 + d * 8, 2);
    case "mountain":     return Math.pow(20 + d * 8, 2);
    case "crystal":      return 18 + d * 6;
    case "dna":          return 48 * (d + 2);
    case "heart":        return Math.pow(28 + d * 8, 2);
    case "brain":        return Math.pow(36 + d * 12, 2);
    case "bone":         return (24 + d * 8) * 4;
    default:             return [12, 42, 162, 642][d] ?? 12;
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

// ─── Loading ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <Html center>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "3px solid #f5c542",
          borderTopColor: "transparent",
          animation: "spin 0.7s linear infinite",
        }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#888", fontFamily: "monospace", letterSpacing: 1 }}>
          GENERATING…
        </span>
      </div>
    </Html>
  );
}

// ─── Dynamic lighting rig ─────────────────────────────────────────────────────

function LightRig({ color }: { color: string }) {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.6) * 4;
      light1.current.position.z = Math.cos(t * 0.6) * 4;
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(t * 0.4) * 3;
      light2.current.position.z = Math.sin(t * 0.4) * 3;
    }
  });
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 6]} intensity={2.2} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={0.1} shadow-camera-far={50}
        shadow-camera-left={-5} shadow-camera-right={5}
        shadow-camera-top={5} shadow-camera-bottom={-5}
      />
      <directionalLight position={[-5, -2, -5]} intensity={0.6} color="#c8e0ff" />
      <pointLight ref={light1} position={[3, 3, 3]} intensity={1.8} color={color} distance={12} decay={2} />
      <pointLight ref={light2} position={[-3, 1, -2]} intensity={1.2} color="#ffffff" distance={10} decay={2} />
      <pointLight position={[0, -3, 0]} intensity={0.5} color="#f5c542" distance={8} decay={2} />
    </>
  );
}

// ─── Shared PBR material ──────────────────────────────────────────────────────

function PBRMat({
  color,
  metalness = 0.3,
  roughness = 0.25,
  emissive,
  emissiveIntensity = 0.08,
}: {
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive ?? color}
      emissiveIntensity={emissiveIntensity}
      envMapIntensity={1.5}
    />
  );
}

// ─── SPHERE — high-poly with distortion ──────────────────────────────────────

function SphereMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.35 * dt;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });
  const segs = 48 + detail * 16;
  return (
    <group scale={scale * 0.78}>
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[1, segs, segs]} />
        <MeshDistortMaterial
          color={color}
          distort={0.18}
          speed={2.5}
          metalness={0.25}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.07}
        />
      </mesh>
      {/* Wireframe shell */}
      <mesh scale={1.02}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.08} />
      </mesh>
      <Sparkles count={20} scale={2.5} size={1.2} speed={0.4} color={color} opacity={0.6} />
    </group>
  );
}

// ─── CUBE — chamfered look with edges ────────────────────────────────────────

function CubeMesh({ color, scale }: { color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) { ref.current.rotation.y += 0.3 * dt; ref.current.rotation.x += 0.18 * dt; }
    if (wireRef.current) { wireRef.current.rotation.y = ref.current?.rotation.y ?? 0; wireRef.current.rotation.x = ref.current?.rotation.x ?? 0; }
  });
  return (
    <group scale={scale * 0.7}>
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <PBRMat color={color} metalness={0.15} roughness={0.35} emissiveIntensity={0.05} />
        <Edges color={color} lineWidth={1.5} threshold={15} />
      </mesh>
      <mesh ref={wireRef} scale={1.04}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

// ─── TORUS — glassy + inner glow ─────────────────────────────────────────────

function TorusMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (ref.current) {
      ref.current.rotation.y += 0.45 * dt;
      ref.current.rotation.x = Math.PI / 4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.35;
    }
    if (innerRef.current) { innerRef.current.rotation.copy(ref.current!.rotation); }
  });
  const s = 32 + detail * 12; const t = 14 + detail * 6;
  return (
    <group scale={scale * 0.7}>
      <mesh ref={ref} castShadow>
        <torusGeometry args={[0.9, 0.36, t, s]} />
        <PBRMat color={color} metalness={0.4} roughness={0.15} emissiveIntensity={0.12} />
      </mesh>
      {/* Inner thin ring for glow effect */}
      <mesh ref={innerRef}>
        <torusGeometry args={[0.9, 0.42, 8, s]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
      </mesh>
      <Sparkles count={16} scale={2.2} size={1.5} speed={0.3} color={color} opacity={0.5} />
    </group>
  );
}

// ─── CONE ─────────────────────────────────────────────────────────────────────

function ConeMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.5 * dt;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
  });
  const segs = 32 + detail * 8;
  return (
    <group scale={scale * 0.7}>
      <mesh ref={ref} castShadow receiveShadow>
        <coneGeometry args={[0.85, 1.9, segs]} />
        <PBRMat color={color} metalness={0.2} roughness={0.3} />
        <Edges color={color} lineWidth={1} threshold={20} />
      </mesh>
    </group>
  );
}

// ─── CYLINDER ─────────────────────────────────────────────────────────────────

function CylinderMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.4 * dt;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.15;
  });
  const segs = 32 + detail * 8;
  return (
    <group scale={scale * 0.7}>
      <mesh ref={ref} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 1.7, segs]} />
        <PBRMat color={color} metalness={0.3} roughness={0.2} emissiveIntensity={0.06} />
        <Edges color={color} lineWidth={1.2} threshold={25} />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[0, 0.86, 0]}>
        <circleGeometry args={[0.7, segs]} />
        <PBRMat color={color} metalness={0.4} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ─── ICOSAHEDRON — sharp facets + wireframe ───────────────────────────────────

function IcoMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.28 * dt;
    ref.current.rotation.x += 0.14 * dt;
  });
  return (
    <group scale={scale * 0.78}>
      <mesh ref={ref} castShadow receiveShadow>
        <icosahedronGeometry args={[1, detail]} />
        <PBRMat color={color} metalness={0.45} roughness={0.18} emissiveIntensity={0.1} />
        <Edges color={color} lineWidth={1.5} threshold={10} />
      </mesh>
      {/* outer wireframe halo */}
      <mesh scale={1.08}>
        <icosahedronGeometry args={[1, Math.max(0, detail - 1)]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

// ─── DODECAHEDRON ─────────────────────────────────────────────────────────────

function DodecaMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.22 * dt;
    ref.current.rotation.z += 0.12 * dt;
  });
  return (
    <group scale={scale * 0.72}>
      <mesh ref={ref} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, detail]} />
        <PBRMat color={color} metalness={0.35} roughness={0.2} emissiveIntensity={0.08} />
        <Edges color={color} lineWidth={1.5} threshold={10} />
      </mesh>
      <mesh scale={1.07}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.09} />
      </mesh>
      <Sparkles count={12} scale={2} size={1} speed={0.3} color={color} opacity={0.4} />
    </group>
  );
}

// ─── STAR — extruded 3D star ──────────────────────────────────────────────────

function StarMesh({ color, scale }: { color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    const outerR = 1, innerR = 0.4, pts = 5;
    for (let i = 0; i < pts * 2; i++) {
      const angle = (i * Math.PI) / pts - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      if (i === 0) shape.moveTo(r * Math.cos(angle), r * Math.sin(angle));
      else shape.lineTo(r * Math.cos(angle), r * Math.sin(angle));
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.5, bevelEnabled: true,
      bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 6,
    });
  }, []);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += 0.45 * dt;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
  });
  return (
    <group scale={scale * 0.58}>
      <mesh ref={ref} geometry={geo} position={[0, 0, -0.25]} castShadow>
        <PBRMat color={color} metalness={0.4} roughness={0.2} emissiveIntensity={0.15} />
      </mesh>
      <Sparkles count={25} scale={3} size={1.5} speed={0.5} color={color} opacity={0.7} />
    </group>
  );
}

// ─── ORGANIC — animated wobble blob (cell / biology) ─────────────────────────

function OrganicMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  // Use MeshWobbleMaterial for live animation
  const ref = useRef<THREE.Mesh>(null);
  const segs = 48 + detail * 16;
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, segs, segs);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const n =
        Math.sin(x * 3.2) * Math.cos(y * 2.8) * Math.sin(z * 4.1) * 0.2 +
        Math.cos(x * 5.1) * Math.sin(y * 4.3) * 0.08 +
        Math.sin(z * 6.7 + y * 2.1) * 0.06;
      const len = Math.sqrt(x * x + y * y + z * z);
      pos.setXYZ(i, (x / len) * (1 + n), (y / len) * (1 + n), (z / len) * (1 + n));
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);
  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.28 * dt;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.3;
  });
  return (
    <group scale={scale * 0.75}>
      <mesh ref={ref} geometry={geo} castShadow>
        <MeshWobbleMaterial
          color={color}
          factor={0.12}
          speed={2}
          metalness={0.1}
          roughness={0.5}
          emissive={color}
          emissiveIntensity={0.06}
        />
      </mesh>
      {/* nucleus inner sphere */}
      <mesh scale={0.35}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#c46c8c" metalness={0.2} roughness={0.4} emissive="#c46c8c" emissiveIntensity={0.3} />
      </mesh>
      <Sparkles count={30} scale={2.8} size={0.8} speed={0.3} color={color} opacity={0.35} />
    </group>
  );
}

// ─── MOLECULE ─────────────────────────────────────────────────────────────────

function MoleculeMesh({ color, scale }: { color: string; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // More atoms for a richer molecule
  const atoms: { pos: [number, number, number]; r: number; col: string }[] = [
    { pos: [0, 0, 0],       r: 0.42, col: color },
    { pos: [1.1, 0.6, 0],   r: 0.28, col: "#f5c542" },
    { pos: [-1.0, 0.7, 0.3],r: 0.28, col: "#88b8e8" },
    { pos: [0, -1.1, 0.5],  r: 0.28, col: "#f5c542" },
    { pos: [0.5, 0.2, 1.1], r: 0.24, col: "#a8d89a" },
    { pos: [-0.4, -0.5,-1.0],r: 0.22, col: "#f4a8b8" },
  ];

  const bondMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#cccccc", metalness: 0.6, roughness: 0.2,
  }), []);

  const atomMats = useMemo(() =>
    atoms.map((a) => new THREE.MeshStandardMaterial({
      color: a.col, metalness: 0.25, roughness: 0.3,
      emissive: a.col, emissiveIntensity: 0.15,
    })),
  []);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.38 * dt;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.45) * 0.3;
  });

  return (
    <group ref={groupRef} scale={scale * 0.6}>
      {/* Bonds */}
      {atoms.slice(1).map((a, i) => {
        const start = new THREE.Vector3(0, 0, 0);
        const end = new THREE.Vector3(...a.pos);
        const dir = end.clone().sub(start);
        const len = dir.length();
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const cyl = new THREE.CylinderGeometry(0.055, 0.055, len, 10);
        const m = new THREE.Mesh(cyl, bondMat);
        m.position.copy(mid);
        m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        return <primitive key={`b${i}`} object={m} />;
      })}
      {/* Atoms */}
      {atoms.map((a, i) => (
        <mesh key={i} position={a.pos} material={atomMats[i]} castShadow>
          <sphereGeometry args={[a.r, 20, 20]} />
        </mesh>
      ))}
      <Sparkles count={20} scale={3} size={1} speed={0.4} color={color} opacity={0.4} />
    </group>
  );
}

// ─── TERRAIN — animated wave mesh ─────────────────────────────────────────────

function TerrainMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireMeshRef = useRef<THREE.Mesh>(null);
  const segs = 32 + detail * 12;

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.4, 2.4, segs, segs);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i,
        Math.sin(x * 2.6) * 0.3 +
        Math.cos(y * 2.1) * 0.25 +
        Math.sin((x + y) * 3.8) * 0.13 +
        Math.cos(x * 5.5 + y * 2.8) * 0.07,
      );
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);

  const wireGeo = useMemo(() => new THREE.PlaneGeometry(2.4, 2.4, 14, 14), []);

  useFrame((state, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.18 * dt;
      meshRef.current.rotation.x = -Math.PI / 3.5 + Math.sin(state.clock.elapsedTime * 0.35) * 0.18;
    }
    if (wireMeshRef.current) {
      wireMeshRef.current.rotation.copy(meshRef.current!.rotation);
    }
  });

  return (
    <group scale={scale * 0.85}>
      <mesh ref={meshRef} geometry={geo} castShadow receiveShadow>
        <PBRMat color={color} metalness={0.08} roughness={0.6} emissiveIntensity={0.04} />
      </mesh>
      <mesh ref={wireMeshRef} geometry={wireGeo} scale={1.01}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// ─── VOLCANO — gunung berapi dengan kawah ────────────────────────────────────

function VolcanoMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const lavaRef = useRef<THREE.Mesh>(null);
  const segs = 32 + detail * 8;

  // Volcano body — cone with flat top (caldera)
  const bodyGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.18, 1.1, 1.6, segs, segs * 2, true);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const nx = pos.getX(i);
      const nz = pos.getZ(i);
      // Add natural rocky bumps
      const angle = Math.atan2(nz, nx);
      const dist = Math.sqrt(nx * nx + nz * nz);
      const bump =
        Math.sin(angle * 7 + y * 3) * 0.06 +
        Math.cos(angle * 5 - y * 4) * 0.04 +
        Math.sin(angle * 11) * 0.025;
      const scale2 = dist + bump;
      const newDist = dist > 0 ? scale2 : 0;
      pos.setXYZ(i,
        (nx / (dist || 1)) * newDist,
        y,
        (nz / (dist || 1)) * newDist,
      );
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);

  // Base / ground ring
  const baseGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.3, 1.5, 0.15, segs);
    return g;
  }, [segs]);

  // Caldera / crater disk
  const craterGeo = useMemo(() => new THREE.CircleGeometry(0.18, 24), []);

  // Lava glow inside crater
  const lavaGeo = useMemo(() => new THREE.CircleGeometry(0.14, 20), []);

  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.2 * dt;
    }
    if (lavaRef.current) {
      // Pulse the lava emissive
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      (lavaRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  const rockColor = color;
  const darkRock = "#5a4033";
  const lavaColor = "#ff4500";
  const glowColor = "#ff6600";

  return (
    <group ref={groupRef} scale={scale * 0.78} position={[0, -0.1, 0]}>
      {/* Base ground */}
      <mesh geometry={baseGeo} position={[0, -0.8, 0]} receiveShadow>
        <meshStandardMaterial color={darkRock} roughness={0.9} metalness={0.0} />
      </mesh>
      {/* Volcano body */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={rockColor}
          roughness={0.85}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Crater rim */}
      <mesh geometry={craterGeo} position={[0, 0.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={darkRock} roughness={0.8} />
      </mesh>
      {/* Lava glow */}
      <mesh ref={lavaRef} geometry={lavaGeo} position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={lavaColor}
          emissive={glowColor}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Lava/smoke particles above crater */}
      <Sparkles
        count={18}
        position={[0, 1.0, 0]}
        scale={[0.5, 1.2, 0.5]}
        size={2.5}
        speed={0.8}
        color={glowColor}
        opacity={0.7}
      />
    </group>
  );
}

// ─── MOUNTAIN — pegunungan 3D realistis ───────────────────────────────────────

function MountainMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const segs = 40 + detail * 10;

  // Main peak
  const peakGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(1.0, 1.8, segs, segs);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const nx = pos.getX(i);
      const nz = pos.getZ(i);
      const angle = Math.atan2(nz, nx);
      const dist = Math.sqrt(nx * nx + nz * nz);
      const t2 = (y + 0.9) / 1.8; // 0..1 from base to tip
      const roughness =
        Math.sin(angle * 9 + y * 5) * 0.07 * (1 - t2) +
        Math.cos(angle * 6 - y * 7) * 0.05 * (1 - t2) +
        Math.sin(angle * 13 + 1.2) * 0.03;
      const newDist = dist + roughness;
      pos.setXYZ(i,
        dist > 0 ? (nx / dist) * newDist : nx,
        y,
        dist > 0 ? (nz / dist) * newDist : nz,
      );
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);

  // Snow cap — small white cone at top
  const snowGeo = useMemo(() => new THREE.ConeGeometry(0.22, 0.45, 16, 4), []);

  // Secondary smaller peaks
  const peak2Geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.55, 1.1, 20, 10);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const nx = pos.getX(i);
      const nz = pos.getZ(i);
      const angle = Math.atan2(nz, nx);
      const dist = Math.sqrt(nx * nx + nz * nz);
      const bump = Math.sin(angle * 7 + y * 4) * 0.05;
      const newDist = dist + bump;
      pos.setXYZ(i, dist > 0 ? (nx / dist) * newDist : nx, y, dist > 0 ? (nz / dist) * newDist : nz);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, []);

  // Base terrain
  const baseGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
    return g;
  }, []);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.18 * dt;
  });

  const rockCol = color;
  const darkRock = new THREE.Color(color).multiplyScalar(0.5).getStyle();
  const snowColor = "#f0f4ff";

  return (
    <group ref={groupRef} scale={scale * 0.72} position={[0, -0.1, 0]}>
      {/* Base */}
      <mesh geometry={baseGeo} position={[0, -0.9, 0]} receiveShadow>
        <meshStandardMaterial color={darkRock} roughness={0.95} metalness={0} />
      </mesh>
      {/* Side peak left */}
      <mesh geometry={peak2Geo} position={[-0.75, -0.5, 0.1]} castShadow>
        <meshStandardMaterial color={darkRock} roughness={0.88} metalness={0.02} />
      </mesh>
      {/* Side peak right */}
      <mesh geometry={peak2Geo} position={[0.7, -0.6, -0.2]} castShadow>
        <meshStandardMaterial color={darkRock} roughness={0.88} metalness={0.02} />
      </mesh>
      {/* Main peak */}
      <mesh geometry={peakGeo} castShadow receiveShadow>
        <meshStandardMaterial color={rockCol} roughness={0.82} metalness={0.04} />
      </mesh>
      {/* Snow cap */}
      <mesh geometry={snowGeo} position={[0, 0.72, 0]} castShadow>
        <meshStandardMaterial color={snowColor} roughness={0.3} metalness={0.0} emissive={snowColor} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

// ─── CRYSTAL — mineral / diamond shape ───────────────────────────────────────

function CrystalMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const crystalGeo = useMemo(() => {
    // Elongated octahedron = crystal
    const g = new THREE.OctahedronGeometry(1, detail);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) * 1.7); // elongate vertically
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [detail]);

  const smallGeo = useMemo(() => {
    const g = new THREE.OctahedronGeometry(0.5, detail);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) * 1.5);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [detail]);

  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.3 * dt;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
  });

  return (
    <group ref={groupRef} scale={scale * 0.65}>
      {/* Main crystal */}
      <mesh geometry={crystalGeo} castShadow>
        <meshPhysicalMaterial
          color={color}
          metalness={0.1}
          roughness={0.05}
          transmission={0.6}
          thickness={1.2}
          ior={1.8}
          reflectivity={0.9}
          emissive={color}
          emissiveIntensity={0.12}
        />
        <Edges color={color} lineWidth={0.8} threshold={5} />
      </mesh>
      {/* Cluster: 2 smaller crystals */}
      <mesh geometry={smallGeo} position={[0.65, -0.3, 0.2]} rotation={[0, 0.5, 0.3]} castShadow>
        <meshPhysicalMaterial color={color} metalness={0.1} roughness={0.05} transmission={0.5} thickness={0.8} ior={1.7} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <mesh geometry={smallGeo} position={[-0.55, -0.4, -0.15]} rotation={[0, -0.4, -0.25]} castShadow>
        <meshPhysicalMaterial color={color} metalness={0.1} roughness={0.05} transmission={0.5} thickness={0.8} ior={1.7} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <Sparkles count={20} scale={2.5} size={1.2} speed={0.5} color={color} opacity={0.6} />
    </group>
  );
}

// ─── DNA — double helix ────────────────────────────────────────────────────────

function DNAMesh({ color, scale }: { color: string; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const strandA: THREE.Mesh[] = [];
  const strandB: THREE.Mesh[] = [];
  const rungs: THREE.Mesh[] = [];

  const STEPS = 20;
  const HEIGHT = 2.4;
  const RADIUS = 0.5;
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.09, 10, 10), []);
  const rungGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.03, RADIUS * 2, 6), []);

  const matA = useMemo(() => new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.2, emissive: color, emissiveIntensity: 0.2 }), [color]);
  const matB = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f5c542", metalness: 0.3, roughness: 0.2, emissive: "#f5c542", emissiveIntensity: 0.2 }), []);
  const matRung = useMemo(() => new THREE.MeshStandardMaterial({ color: "#cccccc", metalness: 0.5, roughness: 0.2 }), []);

  useFrame((state, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.35 * dt;
  });

  const helixElements: React.ReactNode[] = [];
  for (let i = 0; i < STEPS; i++) {
    const t2 = i / (STEPS - 1);
    const angle = t2 * Math.PI * 3; // 1.5 full turns
    const y = (t2 - 0.5) * HEIGHT;

    const ax = Math.cos(angle) * RADIUS;
    const az = Math.sin(angle) * RADIUS;
    const bx = Math.cos(angle + Math.PI) * RADIUS;
    const bz = Math.sin(angle + Math.PI) * RADIUS;

    helixElements.push(
      <mesh key={`a${i}`} position={[ax, y, az]} geometry={sphereGeo} material={matA} castShadow />,
      <mesh key={`b${i}`} position={[bx, y, bz]} geometry={sphereGeo} material={matB} castShadow />,
    );

    if (i % 3 === 0) {
      // Rung connecting the two strands
      const mid = new THREE.Vector3((ax + bx) / 2, y, (az + bz) / 2);
      const dir = new THREE.Vector3(bx - ax, 0, bz - az).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      helixElements.push(
        <mesh key={`r${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat} geometry={rungGeo} material={matRung} />,
      );
    }
  }

  return (
    <group ref={groupRef} scale={scale * 0.75}>
      {helixElements}
      <Sparkles count={15} scale={1.8} size={0.8} speed={0.3} color={color} opacity={0.4} />
    </group>
  );
}

// ─── HEART ────────────────────────────────────────────────────────────────────

function HeartMesh({ color, scale }: { color: string; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    // Heart path
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.3, -0.5, -0.3, -0.5, 0.1);
    shape.bezierCurveTo(-0.5, 0.5, 0, 0.7, 0, 1.0);
    shape.bezierCurveTo(0, 0.7, 0.5, 0.5, 0.5, 0.1);
    shape.bezierCurveTo(0.5, -0.3, 0, -0.3, 0, 0);
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.35, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 8,
    });
  }, []);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.35 * dt;
    // Heartbeat pulse
    const beat = 1 + Math.abs(Math.sin(state.clock.elapsedTime * 1.5)) * 0.08;
    ref.current.scale.setScalar(beat * scale * 0.7);
  });

  return (
    <group>
      <mesh ref={ref} geometry={geo} position={[0, -0.5, -0.18]} castShadow>
        <meshStandardMaterial color={color} metalness={0.15} roughness={0.3} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <Sparkles count={16} scale={2.2} size={1} speed={0.6} color={color} opacity={0.5} />
    </group>
  );
}

// ─── BRAIN ─────────────────────────────────────────────────────────────────────

function BrainMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const segs = 48 + detail * 16;

  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, segs, segs);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      // Deep gyri/sulci folds
      const fold =
        Math.sin(x * 8 + y * 6) * 0.12 +
        Math.cos(y * 9 - z * 7) * 0.10 +
        Math.sin(z * 10 + x * 5) * 0.08 +
        Math.cos(x * 14 + z * 11) * 0.05;
      // Flatten bottom (brainstem)
      const flatBottom = y < -0.5 ? (y + 0.5) * 0.4 : 0;
      const len = Math.sqrt(x * x + y * y + z * z);
      const r = 1 + fold;
      pos.setXYZ(i, (x / len) * r, (y / len) * r + flatBottom, (z / len) * r);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  }, [segs]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.22 * dt;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
  });

  return (
    <group scale={scale * 0.72}>
      <mesh ref={ref} geometry={geo} castShadow>
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} emissive={color} emissiveIntensity={0.05} />
      </mesh>
      {/* Brain hemisphere divider line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.02, 1.8, 1.6]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <Sparkles count={14} scale={2.6} size={0.8} speed={0.2} color={color} opacity={0.3} />
    </group>
  );
}

// ─── BONE — human bone shape ──────────────────────────────────────────────────

function BoneMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const segs = 16 + detail * 4;

  // Long bone shaft + epiphysis balls
  const shaftGeo = useMemo(() => new THREE.CylinderGeometry(0.18, 0.18, 1.6, segs), [segs]);
  const endGeo = useMemo(() => new THREE.SphereGeometry(0.38, segs, segs), [segs]);
  const knobGeo = useMemo(() => new THREE.SphereGeometry(0.28, segs, segs), [segs]);

  useFrame((state, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.28 * dt;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  const boneColor = color;
  const boneWireColor = new THREE.Color(color).multiplyScalar(0.7).getStyle();

  return (
    <group ref={groupRef} scale={scale * 0.72}>
      {/* Shaft */}
      <mesh geometry={shaftGeo} castShadow receiveShadow>
        <PBRMat color={boneColor} metalness={0.08} roughness={0.55} emissiveIntensity={0.04} />
      </mesh>
      {/* Top epiphysis */}
      <mesh geometry={endGeo} position={[0, 0.9, 0]} castShadow>
        <PBRMat color={boneColor} metalness={0.06} roughness={0.5} emissiveIntensity={0.04} />
      </mesh>
      {/* Top knob */}
      <mesh geometry={knobGeo} position={[0.22, 1.0, 0]} castShadow>
        <PBRMat color={boneColor} metalness={0.06} roughness={0.5} />
      </mesh>
      {/* Bottom epiphysis */}
      <mesh geometry={endGeo} position={[0, -0.9, 0]} castShadow>
        <PBRMat color={boneColor} metalness={0.06} roughness={0.5} emissiveIntensity={0.04} />
      </mesh>
      {/* Bottom knob */}
      <mesh geometry={knobGeo} position={[-0.2, -1.0, 0]} castShadow>
        <PBRMat color={boneColor} metalness={0.06} roughness={0.5} />
      </mesh>
      {/* Center canal hint */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 1.6, 10]} />
        <meshBasicMaterial color={boneWireColor} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// ─── PLANET — sphere with atmosphere + ring ───────────────────────────────────

function PlanetMesh({ color, scale, detail }: { color: string; scale: number; detail: number }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const segs = 48 + detail * 16;

  useFrame((state, dt) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.3 * dt;
    }
    if (atmRef.current) {
      atmRef.current.rotation.y += 0.1 * dt;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.05 * dt;
    }
  });

  const atmColor = new THREE.Color(color).lerp(new THREE.Color("#88b8e8"), 0.5).getStyle();

  return (
    <group scale={scale * 0.72}>
      {/* Planet body */}
      <mesh ref={planetRef} castShadow>
        <sphereGeometry args={[1, segs, segs]} />
        <meshStandardMaterial color={color} metalness={0.05} roughness={0.6} emissive={color} emissiveIntensity={0.04} />
      </mesh>
      {/* Atmosphere glow shell */}
      <mesh ref={atmRef} scale={1.08}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={atmColor} transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
      {/* Latitude bands */}
      {[-0.5, 0, 0.5].map((y, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, y * 0.9, 0]}>
          <torusGeometry args={[Math.sqrt(1 - y * y * 0.81), 0.015, 6, segs]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
      ))}
      {/* Optional ring (like Saturn) */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.55, 0.22, 3, 64]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>
      <Sparkles count={8} scale={3} size={0.7} speed={0.2} color={atmColor} opacity={0.3} />
    </group>
  );
}

function GLBModel({ url, scale }: { url: string; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  useEffect(() => {
    scene.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; }
    });
  }, [scene]);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += 0.28 * dt; });
  return (
    <group ref={ref} scale={scale * 0.6}>
      <Center><primitive object={scene.clone()} /></Center>
    </group>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

const F = { speed: 1.2, rotationIntensity: 0.08, floatIntensity: 0.45 };

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
    case "planet":       return <Float {...F}><PlanetMesh color={col} scale={sc} detail={dt} /></Float>;
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
    case "volcano":      return <Float {...F}><VolcanoMesh color={col} scale={sc} detail={dt} /></Float>;
    case "mountain":     return <Float {...F}><MountainMesh color={col} scale={sc} detail={dt} /></Float>;
    case "crystal":      return <Float {...F}><CrystalMesh color={col} scale={sc} detail={dt} /></Float>;
    case "dna":          return <Float {...F}><DNAMesh color={col} scale={sc} /></Float>;
    case "heart":        return <Float {...F}><HeartMesh color={col} scale={sc} /></Float>;
    case "brain":        return <Float {...F}><BrainMesh color={col} scale={sc} detail={dt} /></Float>;
    case "bone":         return <Float {...F}><BoneMesh color={col} scale={sc} detail={dt} /></Float>;
    default:             return <Float {...F}><IcoMesh color={col} scale={sc} detail={dt} /></Float>;
  }
}

// ─── Gradient background plane ────────────────────────────────────────────────

function BgGradient({ color }: { color: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(0.15);
    return new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.35, side: THREE.BackSide });
  }, [color]);
  return (
    <mesh ref={mesh} scale={6}>
      <sphereGeometry args={[1, 16, 16]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────

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
        <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "oklch(0.93 0.02 80)", borderRadius: 16 }}>
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>⬡</div>
            <p style={{ fontWeight: 700, fontSize: 12, color: "#888" }}>{this.props.label}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Public Component ─────────────────────────────────────────────────────────

export function Lesson3D({ spec }: { spec: LessonShape }) {
  const col = /^#[0-9a-fA-F]{6}$/.test(spec.color) ? spec.color : "#f5c542";

  return (
    <ErrBoundary label={spec.label || "3D Model"}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
        style={{ background: "transparent" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.4, 3.8]} fov={42} />
        <LightRig color={col} />
        <BgGradient color={col} />
        <ShapeBody spec={spec} />
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.35}
          scale={6}
          blur={3}
          far={2.5}
          color={col}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={(4 * Math.PI) / 5}
          enableDamping
          dampingFactor={0.06}
        />
      </Canvas>
    </ErrBoundary>
  );
}
