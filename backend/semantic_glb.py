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
        outer = trimesh.creation.icosphere(subdivisions=4, radius=1.0)
        nucleus = trimesh.creation.icosphere(subdivisions=3, radius=0.35)
        nucleus.apply_translation([0.15, 0.1, 0.0])
        mito = trimesh.creation.capsule(height=0.5, radius=0.12)
        mito.apply_translation([0.55, 0.3, 0.2])
        mito2 = trimesh.creation.capsule(height=0.4, radius=0.1)
        mito2.apply_translation([-0.45, -0.35, 0.15])
        return trimesh.util.concatenate([outer, nucleus, mito, mito2])

    if any(k in t for k in ("tulang", "bone", "skull", "kerangka", "skeleton")):
        skull = trimesh.creation.icosphere(subdivisions=3, radius=0.45)
        skull.apply_translation([0, 0.85, 0])
        spine_parts = []
        for i in range(8):
            v = trimesh.creation.cylinder(radius=0.08, height=0.12)
            v.apply_translation([0, 0.65 - i * 0.14, 0])
            spine_parts.append(v)
        rib = trimesh.creation.torus(major_radius=0.35, minor_radius=0.04, major_sections=24)
        rib.apply_translation([0, 0.35, 0])
        return trimesh.util.concatenate([skull, *spine_parts, rib])

    if any(k in t for k in ("atom", "molekul", "molecule", "elektron")):
        core = trimesh.creation.icosphere(subdivisions=3, radius=0.25)
        orbit_parts = []
        for angle in [0, 1.2, 2.4]:
            torus = trimesh.creation.torus(major_radius=0.7, minor_radius=0.03, major_sections=32)
            rot = trimesh.transformations.rotation_matrix(angle, [1, 0, 0])
            torus.apply_transform(rot)
            orbit_parts.append(torus)
            e = trimesh.creation.icosphere(subdivisions=1, radius=0.08)
            e.apply_translation([0.7 * np.cos(angle), 0.7 * np.sin(angle), 0])
            orbit_parts.append(e)
        return trimesh.util.concatenate([core, *orbit_parts])

    if any(k in t for k in ("matahari", "sun", "bintang", "star")):
        core = trimesh.creation.icosphere(subdivisions=4, radius=0.75)
        spikes = []
        for i in range(12):
            c = trimesh.creation.cone(radius=0.12, height=0.5)
            a = i * (2 * np.pi / 12)
            c.apply_translation([0.95 * np.cos(a), 0.95 * np.sin(a), 0])
            c.apply_transform(trimesh.transformations.rotation_matrix(a, [0, 0, 1]))
            spikes.append(c)
        return trimesh.util.concatenate([core, *spikes])

    if any(k in t for k in ("planet", "bumi", "earth", "mars", "jupiter", "saturn")):
        body = trimesh.creation.icosphere(subdivisions=4, radius=0.85)
        if "saturn" in t or "saturnus" in t:
            ring = trimesh.creation.annulus(r_min=1.0, r_max=1.4, height=0.02)
            ring.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0]))
            return trimesh.util.concatenate([body, ring])
        return body

    if any(k in t for k in ("monyet", "monkey", "kera", "hewan", "animal")):
        head = trimesh.creation.icosphere(subdivisions=3, radius=0.35)
        head.apply_translation([0, 0.55, 0])
        body = trimesh.creation.capsule(height=0.7, radius=0.3)
        body.apply_translation([0, 0, 0])
        arm_l = trimesh.creation.capsule(height=0.5, radius=0.08)
        arm_l.apply_translation([-0.45, 0.15, 0])
        arm_r = trimesh.creation.capsule(height=0.5, radius=0.08)
        arm_r.apply_translation([0.45, 0.15, 0])
        return trimesh.util.concatenate([head, body, arm_l, arm_r])

    if any(k in t for k in ("jantung", "heart")):
        left = trimesh.creation.icosphere(subdivisions=3, radius=0.45)
        left.apply_translation([-0.25, 0.35, 0])
        right = trimesh.creation.icosphere(subdivisions=3, radius=0.45)
        right.apply_translation([0.25, 0.35, 0])
        base = trimesh.creation.cone(radius=0.5, height=0.8)
        base.apply_translation([0, -0.2, 0])
        return trimesh.util.concatenate([left, right, base])

    if any(k in t for k in ("mikroskop", "microscope")):
        base = trimesh.creation.cylinder(radius=0.5, height=0.15)
        base.apply_translation([0, -0.6, 0])
        arm = trimesh.creation.cylinder(radius=0.06, height=1.0)
        arm.apply_translation([0, -0.05, 0])
        tube = trimesh.creation.cylinder(radius=0.12, height=0.35)
        tube.apply_translation([0, 0.55, 0])
        lens = trimesh.creation.cylinder(radius=0.18, height=0.08)
        lens.apply_translation([0, 0.75, 0])
        return trimesh.util.concatenate([base, arm, tube, lens])

    if any(k in t for k in ("daun", "leaf", "tumbuhan", "plant")):
        mesh = trimesh.creation.icosphere(subdivisions=3, radius=0.8)
        mesh.apply_transform(trimesh.transformations.scale_matrix([1.6, 0.15, 0.9]))
        stem = trimesh.creation.cylinder(radius=0.04, height=0.6)
        stem.apply_translation([0, -0.5, 0])
        return trimesh.util.concatenate([mesh, stem])

    if any(k in t for k in ("gunung", "mountain", "terrain")):
        return trimesh.creation.cone(radius=1.0, height=1.4, sections=6)

    if any(k in t for k in ("matematika", "math", "geometri", "geometry")):
        return trimesh.creation.icosahedron(subdivisions=2, radius=1.0)

    if any(k in t for k in ("sejarah", "history", "artefak", "artifact")):
        return trimesh.creation.box(extents=[0.6, 1.2, 0.6])

    # Universal fallback — smooth icosahedron (real mesh, not browser sphere)
    return trimesh.creation.icosphere(subdivisions=4, radius=1.0)


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
