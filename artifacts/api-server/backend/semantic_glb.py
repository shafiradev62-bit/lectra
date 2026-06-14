"""
Semantic mesh generator — production GLB from topic labels.
Uses trimesh + post-processing (manifold cleanup, decimation).
Works without GPU / ML models — always produces real GLB files.
"""

from __future__ import annotations

import hashlib
import json
import logging
from pathlib import Path

import numpy as np
import trimesh

logger = logging.getLogger(__name__)


def _keyword(prompt: str) -> str:
    return prompt.strip().lower()


def build_semantic_mesh(prompt: str) -> trimesh.Trimesh:
    """Build a topic-aware mesh — replaces browser dummy geometry."""
    t = _keyword(prompt)

    if any(k in t for k in ("sel", "cell", "sitoplasma", "organel")):
        outer = trimesh.creation.icosphere(subdivisions=5, radius=1.0)
        nucleus = trimesh.creation.icosphere(subdivisions=4, radius=0.35)
        nucleus.apply_translation([0.15, 0.1, 0.0])
        mito = trimesh.creation.capsule(height=0.5, radius=0.12)
        mito.apply_translation([0.55, 0.3, 0.2])
        mito2 = trimesh.creation.capsule(height=0.4, radius=0.1)
        mito2.apply_translation([-0.45, -0.35, 0.15])
        ribo = [trimesh.creation.icosphere(subdivisions=2, radius=0.05) for _ in range(15)]
        for i, r in enumerate(ribo):
            theta = np.random.uniform(0, 2 * np.pi)
            phi = np.random.uniform(0, np.pi)
            x = 0.8 * np.sin(phi) * np.cos(theta)
            y = 0.8 * np.sin(phi) * np.sin(theta)
            z = 0.8 * np.cos(phi)
            r.apply_translation([x, y, z])
        return trimesh.util.concatenate([outer, nucleus, mito, mito2, *ribo])

    if any(k in t for k in ("tulang", "bone", "skull", "kerangka", "skeleton")):
        skull = trimesh.creation.icosphere(subdivisions=4, radius=0.45)
        skull.apply_translation([0, 0.85, 0])
        spine_parts = []
        for i in range(8):
            v = trimesh.creation.cylinder(radius=0.08, height=0.12)
            v.apply_translation([0, 0.65 - i * 0.14, 0])
            spine_parts.append(v)
        ribs = []
        for i in range(6):
            rib = trimesh.creation.torus(major_radius=0.35, minor_radius=0.04, major_sections=24)
            rib.apply_translation([0, 0.35 - i * 0.1, 0])
            ribs.append(rib)
        pelvis = trimesh.creation.box(extents=[0.4, 0.15, 0.3])
        pelvis.apply_translation([0, -0.35, 0])
        return trimesh.util.concatenate([skull, *spine_parts, *ribs, pelvis])

    if any(k in t for k in ("atom", "molekul", "molecule", "elektron")):
        core = trimesh.creation.icosphere(subdivisions=4, radius=0.25)
        orbit_parts = []
        for angle in [0, 1.2, 2.4]:
            torus = trimesh.creation.torus(major_radius=0.7, minor_radius=0.03, major_sections=48)
            rot = trimesh.transformations.rotation_matrix(angle, [1, 0, 0])
            torus.apply_transform(rot)
            orbit_parts.append(torus)
            for e_angle in [angle, angle + np.pi/3]:
                e = trimesh.creation.icosphere(subdivisions=2, radius=0.08)
                e.apply_translation([0.7 * np.cos(e_angle), 0.7 * np.sin(e_angle), 0])
                orbit_parts.append(e)
        return trimesh.util.concatenate([core, *orbit_parts])

    if any(k in t for k in ("matahari", "sun", "bintang", "star")):
        core = trimesh.creation.icosphere(subdivisions=5, radius=0.75)
        spikes = []
        for i in range(24):
            c = trimesh.creation.cone(radius=0.08, height=0.6)
            a = i * (2 * np.pi / 24)
            b = np.random.uniform(0, np.pi)
            c.apply_translation([0.95 * np.sin(b) * np.cos(a), 0.95 * np.sin(b) * np.sin(a), 0.95 * np.cos(b)])
            # Rotate the cone to point outward
            dir_vec = np.array([np.sin(b)*np.cos(a), np.sin(b)*np.sin(a), np.cos(b)])
            up_vec = np.array([0, 1, 0])
            rot_axis = np.cross(up_vec, dir_vec)
            rot_angle = np.arccos(np.dot(up_vec, dir_vec))
            if np.linalg.norm(rot_axis) > 1e-6:
                rot_mat = trimesh.transformations.rotation_matrix(rot_angle, rot_axis)
                c.apply_transform(rot_mat)
            spikes.append(c)
        return trimesh.util.concatenate([core, *spikes])

    if any(k in t for k in ("planet", "bumi", "earth", "mars", "jupiter", "saturn")):
        body = trimesh.creation.icosphere(subdivisions=5, radius=0.85)
        # Add some terrain variation
        verts = body.vertices.copy()
        for i in range(len(verts)):
            n = np.linalg.norm(verts[i])
            noise = np.sin(verts[i][0] * 5) * np.cos(verts[i][1] * 5) * np.sin(verts[i][2] * 5) * 0.05
            verts[i] = verts[i] * (1 + noise) / n
        body.vertices = verts
        body.compute_vertex_normals()
        
        if "saturn" in t or "saturnus" in t:
            ring = trimesh.creation.annulus(r_min=1.0, r_max=1.4, height=0.02)
            ring.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2.5, [1, 0, 0]))
            return trimesh.util.concatenate([body, ring])
        return body

    if any(k in t for k in ("monyet", "monkey", "kera", "hewan", "animal")):
        head = trimesh.creation.icosphere(subdivisions=4, radius=0.35)
        head.apply_translation([0, 0.55, 0])
        body = trimesh.creation.capsule(height=0.7, radius=0.3)
        body.apply_translation([0, 0, 0])
        arm_l = trimesh.creation.capsule(height=0.5, radius=0.08)
        arm_l.apply_translation([-0.45, 0.15, 0])
        arm_r = trimesh.creation.capsule(height=0.5, radius=0.08)
        arm_r.apply_translation([0.45, 0.15, 0])
        leg_l = trimesh.creation.capsule(height=0.5, radius=0.09)
        leg_l.apply_translation([-0.2, -0.5, 0])
        leg_r = trimesh.creation.capsule(height=0.5, radius=0.09)
        leg_r.apply_translation([0.2, -0.5, 0])
        return trimesh.util.concatenate([head, body, arm_l, arm_r, leg_l, leg_r])

    if any(k in t for k in ("jantung", "heart")):
        left = trimesh.creation.icosphere(subdivisions=4, radius=0.45)
        left.apply_translation([-0.25, 0.35, 0])
        right = trimesh.creation.icosphere(subdivisions=4, radius=0.45)
        right.apply_translation([0.25, 0.35, 0])
        base = trimesh.creation.cone(radius=0.5, height=0.8)
        base.apply_translation([0, -0.2, 0])
        aorta = trimesh.creation.cylinder(radius=0.08, height=0.3)
        aorta.apply_translation([0, 0.6, 0])
        return trimesh.util.concatenate([left, right, base, aorta])

    if any(k in t for k in ("mikroskop", "microscope")):
        base = trimesh.creation.cylinder(radius=0.5, height=0.15)
        base.apply_translation([0, -0.6, 0])
        arm = trimesh.creation.cylinder(radius=0.06, height=1.0)
        arm.apply_translation([0, -0.05, 0])
        tube = trimesh.creation.cylinder(radius=0.12, height=0.35)
        tube.apply_translation([0, 0.55, 0])
        lens = trimesh.creation.cylinder(radius=0.18, height=0.08)
        lens.apply_translation([0, 0.75, 0])
        stage = trimesh.creation.box(extents=[0.3, 0.05, 0.3])
        stage.apply_translation([0, 0.2, 0])
        return trimesh.util.concatenate([base, arm, tube, lens, stage])

    if any(k in t for k in ("daun", "leaf", "tumbuhan", "plant")):
        # Create a leaf-like shape
        leaf = trimesh.creation.icosphere(subdivisions=4, radius=0.8)
        # Flatten and stretch
        leaf.apply_transform(trimesh.transformations.scale_matrix([1.6, 0.15, 0.9]))
        # Add wavy edges
        verts = leaf.vertices.copy()
        for i in range(len(verts)):
            x, y, z = verts[i]
            wave = np.sin(x * 4) * 0.1
            verts[i][1] += wave
        leaf.vertices = verts
        leaf.compute_vertex_normals()
        
        stem = trimesh.creation.cylinder(radius=0.04, height=0.6)
        stem.apply_translation([0, -0.5, 0])
        return trimesh.util.concatenate([leaf, stem])

    if any(k in t for k in ("gunung", "mountain", "terrain")):
        # Create a mountain with multiple peaks
        base = trimesh.creation.cylinder(radius=1.2, height=0.2)
        base.apply_translation([0, -0.8, 0])
        
        main_peak = trimesh.creation.cone(radius=0.7, height=1.4, sections=24)
        main_peak.apply_translation([0, 0.1, 0])
        
        # Add smaller peaks
        peak1 = trimesh.creation.cone(radius=0.35, height=0.8, sections=16)
        peak1.apply_translation([-0.6, -0.2, 0.2])
        
        peak2 = trimesh.creation.cone(radius=0.3, height=0.6, sections=16)
        peak2.apply_translation([0.5, -0.3, -0.3])
        
        return trimesh.util.concatenate([base, main_peak, peak1, peak2])

    if any(k in t for k in ("matematika", "math", "geometri", "geometry")):
        # Create a compound geometric shape
        ico = trimesh.creation.icosahedron(subdivisions=2, radius=1.0)
        cube = trimesh.creation.box(extents=[0.4, 0.4, 0.4])
        return trimesh.util.concatenate([ico, cube])

    if any(k in t for k in ("sejarah", "history", "artefak", "artifact")):
        # Create a vase-like shape
        body = trimesh.creation.cylinder(radius=0.3, height=1.0)
        neck = trimesh.creation.cylinder(radius=0.15, height=0.2)
        neck.apply_translation([0, 0.6, 0])
        base = trimesh.creation.cylinder(radius=0.4, height=0.1)
        base.apply_translation([0, -0.55, 0])
        return trimesh.util.concatenate([body, neck, base])

    # Universal fallback — smooth icosphere (real mesh, not browser sphere)
    return trimesh.creation.icosphere(subdivisions=5, radius=1.0)


def optimize_mesh(mesh: trimesh.Trimesh, target_faces: int = 8000) -> trimesh.Trimesh:
    """Lightweight post-processing — mirrors ar3d-engine Stage 4."""
    mesh.merge_vertices()
    mesh.update_faces(mesh.unique_faces())
    mesh.remove_unreferenced_vertices()
    if len(mesh.faces) > target_faces:
        try:
            mesh = mesh.simplify_quadric_decimation(target_faces)
        except Exception:
            pass
    return mesh


def generate_glb(prompt: str, output_path: Path) -> dict:
    """Generate optimized GLB from topic label. Returns metadata."""
    mesh = build_semantic_mesh(prompt)
    mesh = optimize_mesh(mesh)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(str(output_path), file_type="glb")
    meta_path = output_path.with_suffix(".json")
    meta = {
        "prompt": prompt,
        "vertices": len(mesh.vertices),
        "faces": len(mesh.faces),
        "format": "glb",
    }
    meta_path.write_text(json.dumps(meta), encoding="utf-8")
    return meta


def cache_key(prompt: str) -> str:
    return hashlib.md5(_keyword(prompt).encode()).hexdigest()
