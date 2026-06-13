import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ShapeType } from "@/lib/lesson-generator";

const SHAPE_ICONS: Record<ShapeType, keyof typeof Ionicons.glyphMap> = {
  sphere: "planet-outline",
  cube: "cube-outline",
  torus: "ellipse-outline",
  cone: "triangle-outline",
  cylinder: "disc-outline",
  icosahedron: "diamond-outline",
  dodecahedron: "shapes-outline",
  organic: "leaf-outline",
  molecule: "apps-outline",
  terrain: "earth-outline",
  star: "star-outline",
  replicate: "reload-outline",
};

interface Props {
  type: ShapeType;
  color: string;
  size?: number;
}

export default function ShapeIcon({ type, color, size = 40 }: Props) {
  const icon = SHAPE_ICONS[type] ?? "shapes-outline";
  const bg = color + "33";
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Ionicons name={icon} size={size * 0.55} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
