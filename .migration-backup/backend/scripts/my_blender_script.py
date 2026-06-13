"""
Blender CLI script — headless, fast, no API keys needed.
Called by main.py as:
  blender --background --python my_blender_script.py -- --prompts "A,B,C" --outputs "a.glb,b.glb,c.glb"

Processes ALL prompts in ONE Blender session to avoid per-prompt startup overhead.
"""

import sys
import bpy
import math


# ─── helpers ──────────────────────────────────────────────────────────────────

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        bpy.data.materials.remove(block)


def add_material(obj, color_rgba, roughness=0.5, metalness=0.0, emission=None):
    mat = bpy.data.materials.new(name="M")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color_rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metalness
    if emission:
        bsdf.inputs["Emission Color"].default_value = emission
        bsdf.inputs["Emission Strength"].default_value = 2.5
    obj.data.materials.append(mat)
    return mat


def setup_lights_and_camera():
    # Key light
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 8))
    sun = bpy.context.active_object
    sun.data.energy = 3.0

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-4, -4, 4))
    fill = bpy.context.active_object
    fill.data.energy = 500
    fill.data.size = 4

    # Camera
    bpy.ops.object.camera_add(location=(0, -6, 2))
    cam = bpy.context.active_object
    cam.rotation_euler = (math.radians(80), 0, 0)
    bpy.context.scene.camera = cam


# ─── model builders ───────────────────────────────────────────────────────────

def build_sun(prompt_lower):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=1.6, subdivisions=4)
    sun = bpy.context.active_object
    sun.name = "Sun"
    add_material(sun, (1.0, 0.85, 0.1, 1), roughness=0.6, emission=(1.0, 0.55, 0.0, 1))

    # Corona spikes
    for i in range(8):
        angle = (i / 8) * math.pi * 2
        bpy.ops.mesh.primitive_cone_add(
            radius1=0.15, radius2=0.0, depth=0.7,
            location=(math.cos(angle) * 1.9, math.sin(angle) * 1.9, 0)
        )
        spike = bpy.context.active_object
        spike.rotation_euler = (0, 0, angle + math.pi / 2)
        add_material(spike, (1.0, 0.7, 0.0, 1), roughness=0.4, emission=(1.0, 0.5, 0.0, 1))


def build_earth(prompt_lower):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.5, segments=48, ring_count=24)
    earth = bpy.context.active_object
    earth.name = "Earth"
    add_material(earth, (0.08, 0.35, 0.75, 1), roughness=0.7)

    # Continents as overlaid spheres (clipped)
    continent_data = [
        ((-0.5, 0.8, 1.0), 0.45),
        ((0.4, 0.3, 1.2), 0.4),
        ((0.9, -0.2, 0.9), 0.5),
        ((0.0, -1.3, 0.3), 0.35),
    ]
    for pos, r in continent_data:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=pos, segments=16, ring_count=8)
        c = bpy.context.active_object
        add_material(c, (0.18, 0.5, 0.2, 1), roughness=0.9)


def build_cell(prompt_lower):
    # Outer membrane (transparent-ish)
    bpy.ops.mesh.primitive_ico_sphere_add(radius=1.8, subdivisions=3)
    cell = bpy.context.active_object
    cell.name = "Cell"
    mat = bpy.data.materials.new("CellMembrane")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.6, 0.9, 0.6, 0.4)
    bsdf.inputs["Alpha"].default_value = 0.5
    bsdf.inputs["Roughness"].default_value = 0.1
    bsdf.inputs["Transmission Weight"].default_value = 0.6
    mat.blend_method = 'BLEND'
    cell.data.materials.append(mat)

    # Nucleus
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.55, location=(0.2, -0.1, 0.2), subdivisions=2)
    nuc = bpy.context.active_object
    nuc.name = "Nucleus"
    add_material(nuc, (0.55, 0.1, 0.7, 1), roughness=0.3, metalness=0.1)

    # Mitochondria x2
    for pos in [(-0.7, 0.5, 0.3), (0.6, -0.6, -0.2)]:
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.22, location=pos, subdivisions=1)
        mito = bpy.context.active_object
        mito.scale = (1.8, 0.8, 0.8)
        add_material(mito, (0.8, 0.2, 0.15, 1), roughness=0.4)

    # Vacuole
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, location=(-0.3, -0.5, -0.4), segments=12, ring_count=8)
    vac = bpy.context.active_object
    add_material(vac, (0.3, 0.6, 0.9, 1), roughness=0.2)


def build_atom(prompt_lower):
    # Nucleus cluster
    for i in range(6):
        angle = (i / 6) * math.pi * 2
        r = 0.15
        x = math.cos(angle) * r
        y = math.sin(angle) * r
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.18, location=(x, y, 0), subdivisions=1)
        p = bpy.context.active_object
        color = (0.9, 0.2, 0.2, 1) if i % 2 == 0 else (0.9, 0.8, 0.1, 1)
        add_material(p, color, roughness=0.3)

    # Electron shells (torus rings)
    shell_radii = [0.85, 1.35, 1.8]
    shell_rotations = [(math.pi / 2, 0, 0), (0, 0, 0), (math.pi / 4, math.pi / 4, 0)]
    for radius, rot in zip(shell_radii, shell_rotations):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=radius, minor_radius=0.03,
            major_segments=32, minor_segments=8
        )
        ring = bpy.context.active_object
        ring.rotation_euler = rot
        add_material(ring, (0.3, 0.7, 1.0, 1), roughness=0.2, metalness=0.5)

    # Electrons
    for shell_i, radius in enumerate(shell_radii):
        n_electrons = shell_i + 1
        rot = shell_rotations[shell_i]
        for e_i in range(n_electrons):
            angle = (e_i / n_electrons) * math.pi * 2
            # Approximate position on ring (ignoring tilt for simplicity)
            ex = math.cos(angle) * radius
            ey = math.sin(angle) * radius
            bpy.ops.mesh.primitive_ico_sphere_add(radius=0.08, location=(ex, ey, 0), subdivisions=1)
            el = bpy.context.active_object
            add_material(el, (0.1, 0.8, 1.0, 1), roughness=0.1, emission=(0.0, 0.6, 1.0, 1))


def build_bone_skeleton(prompt_lower):
    # Skull
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, location=(0, 0, 2.2), segments=24, ring_count=16)
    skull = bpy.context.active_object
    skull.scale = (1, 0.85, 1)
    add_material(skull, (0.94, 0.9, 0.82, 1), roughness=0.9)

    # Mandible
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.32, location=(0, 0.05, 1.7), segments=16, ring_count=8)
    jaw = bpy.context.active_object
    jaw.scale = (0.85, 0.55, 0.4)
    add_material(jaw, (0.9, 0.86, 0.78, 1), roughness=0.9)

    # Spine (vertebrae stack)
    for i in range(10):
        y = 1.4 - i * 0.22
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.14 - i * 0.005, depth=0.16,
            location=(0, 0, y)
        )
        v = bpy.context.active_object
        add_material(v, (0.92, 0.88, 0.80, 1), roughness=0.85)

    # Ribcage
    for side in [-1, 1]:
        for i in range(6):
            y = 0.9 - i * 0.18
            rx = side * (0.3 + i * 0.05)
            bpy.ops.mesh.primitive_torus_add(
                major_radius=0.38 + i * 0.03, minor_radius=0.045,
                major_segments=24, minor_segments=6,
                location=(rx * 0.5, 0, y)
            )
            rib = bpy.context.active_object
            rib.rotation_euler = (0, 0, side * math.radians(30 + i * 5))
            rib.scale = (1, 0.5, 0.7)
            add_material(rib, (0.9, 0.86, 0.78, 1), roughness=0.85)


def build_monkey(prompt_lower):
    bpy.ops.mesh.primitive_monkey_add(size=2.0, location=(0, 0, 0))
    monkey = bpy.context.active_object
    monkey.name = "Suzanne"
    # Smooth shading
    for poly in monkey.data.polygons:
        poly.use_smooth = True
    add_material(monkey, (0.36, 0.25, 0.15, 1), roughness=0.85)

    # Simple body
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.9, location=(0, 0, -1.5), subdivisions=2)
    body = bpy.context.active_object
    body.scale = (0.7, 0.55, 1.0)
    add_material(body, (0.36, 0.25, 0.15, 1), roughness=0.85)


def build_planet(prompt_lower):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.6, segments=32, ring_count=16)
    planet = bpy.context.active_object
    # Random planet colors by keywords
    if "mars" in prompt_lower:
        add_material(planet, (0.72, 0.28, 0.1, 1), roughness=0.9)
    elif "saturnus" in prompt_lower or "saturn" in prompt_lower:
        add_material(planet, (0.85, 0.75, 0.55, 1), roughness=0.7)
        # Rings
        bpy.ops.mesh.primitive_torus_add(major_radius=2.5, minor_radius=0.3, major_segments=48, minor_segments=4)
        ring = bpy.context.active_object
        ring.rotation_euler = (math.radians(10), 0, 0)
        add_material(ring, (0.85, 0.80, 0.65, 0.8), roughness=0.6)
    elif "jupiter" in prompt_lower:
        add_material(planet, (0.78, 0.62, 0.48, 1), roughness=0.6)
        # Bands (thin tori)
        for i, col in enumerate([(0.65, 0.45, 0.3, 1), (0.88, 0.75, 0.6, 1)]):
            bpy.ops.mesh.primitive_torus_add(major_radius=1.61 + i*0.1, minor_radius=0.12, major_segments=48, minor_segments=4)
            band = bpy.context.active_object
            add_material(band, col, roughness=0.7)
    else:
        add_material(planet, (0.5, 0.4, 0.75, 1), roughness=0.6)


def build_volcano(prompt_lower):
    bpy.ops.mesh.primitive_cone_add(radius1=2.0, radius2=0.4, depth=2.5, location=(0, 0, 0))
    mountain = bpy.context.active_object
    add_material(mountain, (0.3, 0.22, 0.15, 1), roughness=0.95)

    # Crater
    bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=0.5, location=(0, 0, 1.28))
    crater = bpy.context.active_object
    add_material(crater, (0.15, 0.1, 0.1, 1), roughness=1.0)

    # Lava glow
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=0.2, location=(0, 0, 1.3))
    lava = bpy.context.active_object
    add_material(lava, (1.0, 0.25, 0.0, 1), roughness=0.3, emission=(1.0, 0.2, 0.0, 1))


def build_mountain_terrain(prompt_lower):
    # Subdivided plane for terrain
    bpy.ops.mesh.primitive_plane_add(size=5, location=(0, 0, 0))
    plane = bpy.context.active_object
    # Subdivide
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=12)
    bpy.ops.object.mode_set(mode='OBJECT')
    # Displace vertices manually
    import random
    random.seed(42)
    mesh = plane.data
    for v in mesh.vertices:
        d = math.sin(v.co.x * 2.5) * math.cos(v.co.y * 2.5) * 0.7
        d += random.uniform(-0.15, 0.15)
        v.co.z = max(0, d)
    mesh.calc_normals()
    add_material(plane, (0.35, 0.55, 0.25, 1), roughness=0.95)


def build_default(prompt_lower):
    # Interesting default: dodecahedron
    bpy.ops.mesh.primitive_ico_sphere_add(radius=1.4, subdivisions=3)
    obj = bpy.context.active_object
    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True
    add_material(obj, (0.3, 0.55, 0.85, 1), roughness=0.35, metalness=0.3)

    # Orbit ring decoration
    bpy.ops.mesh.primitive_torus_add(major_radius=1.8, minor_radius=0.04, major_segments=48, minor_segments=8)
    ring = bpy.context.active_object
    ring.rotation_euler = (math.radians(30), math.radians(45), 0)
    add_material(ring, (0.9, 0.7, 0.1, 1), roughness=0.2, metalness=0.8)


# ─── prompt → builder dispatch ────────────────────────────────────────────────

def create_model(prompt: str):
    p = prompt.lower()

    if any(k in p for k in ["matahari", "sun", "bintang", "star", "solar"]):
        build_sun(p)
    elif any(k in p for k in ["bumi", "earth"]):
        build_earth(p)
    elif any(k in p for k in ["sel", "cell", "sitoplasma", "membran sel", "nukleus"]):
        build_cell(p)
    elif any(k in p for k in ["atom", "molekul", "molecule", "elektron", "bohr"]):
        build_atom(p)
    elif any(k in p for k in ["tulang", "bone", "rangka", "skeletal", "skull"]):
        build_bone_skeleton(p)
    elif any(k in p for k in ["monyet", "monkey", "kera", "ape", "suzanne"]):
        build_monkey(p)
    elif any(k in p for k in ["gunung berapi", "volcano", "lava", "magma"]):
        build_volcano(p)
    elif any(k in p for k in ["gunung", "mountain", "terrain", "lempeng", "tektonik"]):
        build_mountain_terrain(p)
    elif any(k in p for k in ["planet", "mars", "jupiter", "saturnus", "saturn", "venus", "merkurius"]):
        build_planet(p)
    else:
        build_default(p)


# ─── export helpers ───────────────────────────────────────────────────────────

def export_model(output_path: str):
    """Export current scene to .glb or .obj based on file extension."""
    ext = output_path.lower().rsplit(".", 1)[-1]
    if ext == "glb" or ext == "gltf":
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            export_format='GLB',
            export_apply=True,           # apply modifiers
            export_cameras=False,
            export_lights=False,
            use_selection=False,
        )
    else:
        bpy.ops.wm.obj_export(filepath=output_path)


# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    try:
        argv = sys.argv[sys.argv.index("--") + 1:]
    except ValueError:
        argv = []

    prompts = []
    outputs = []

    i = 0
    while i < len(argv):
        if argv[i] == "--prompts" and i + 1 < len(argv):
            prompts = [p.strip() for p in argv[i + 1].split("|||")]
            i += 2
        elif argv[i] == "--outputs" and i + 1 < len(argv):
            outputs = [o.strip() for o in argv[i + 1].split("|||")]
            i += 2
        # Legacy single-prompt support
        elif argv[i] == "--prompt" and i + 1 < len(argv):
            prompts = [argv[i + 1]]
            i += 2
        elif argv[i] == "--output" and i + 1 < len(argv):
            outputs = [argv[i + 1]]
            i += 2
        else:
            i += 1

    if not prompts:
        prompts = ["default object"]
    if not outputs:
        outputs = ["output.glb"]

    # Pad outputs if needed
    while len(outputs) < len(prompts):
        outputs.append(f"output_{len(outputs)}.glb")

    # Process each prompt in the SAME Blender session
    for prompt, output_path in zip(prompts, outputs):
        print(f"[Blender] Generating: '{prompt}' → {output_path}")
        clear_scene()
        setup_lights_and_camera()
        create_model(prompt)
        export_model(output_path)
        print(f"[Blender] Done: {output_path}")


if __name__ == "__main__":
    main()
