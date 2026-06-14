
from pathlib import Path
from semantic_glb import generate_glb

print("Testing cell model...")
meta = generate_glb("sel", Path("test_cell.glb"))
print(f"Generated cell model: {meta}")

print("\nTesting mountain model...")
meta = generate_glb("gunung", Path("test_mountain.glb"))
print(f"Generated mountain model: {meta}")

print("\nTesting planet model...")
meta = generate_glb("planet", Path("test_planet.glb"))
print(f"Generated planet model: {meta}")

print("\nTest complete!")
