---
name: Lectra required packages
description: npm packages needed in artifacts/lectra that aren't pre-installed
---

Must be installed in artifacts/lectra (pnpm add from that dir):
- motion (provides motion/react and motion/react)
- animejs (v4+)
- qrcode + @types/qrcode
- @react-three/fiber
- @react-three/drei
- three + @types/three

**Why:** These weren't in the base scaffold and vite dev fails silently-but-fast with "Failed to resolve import" errors. Install from artifacts/lectra dir, not workspace root.
