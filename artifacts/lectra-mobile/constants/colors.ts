/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: "#2C2925",
    tint: "#E67D28",
    background: "#F8F4EE",
    foreground: "#2C2925",
    card: "#FDFCF9",
    cardForeground: "#2C2925",
    primary: "#2C2925",
    primaryForeground: "#F8F4EE",
    secondary: "#EDE7DD",
    secondaryForeground: "#2C2925",
    muted: "#EDE7DD",
    mutedForeground: "#706860",
    accent: "#E67D28",
    accentForeground: "#FFFFFF",
    destructive: "#C94A2F",
    destructiveForeground: "#FFFFFF",
    border: "#E1DAD0",
    input: "#EDE7DD",
    sun: "#F5CE58",
    leaf: "#7BBD81",
    blush: "#EDAFA7",
    sky: "#8EB7DD",
  },
  radius: 16,
};

export default colors;
