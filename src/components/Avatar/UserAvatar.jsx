const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#2563eb" }, // A, B
  { bg: "#fce7f3", color: "#db2777" }, // C, D
  { bg: "#d1fae5", color: "#059669" }, // E, F
  { bg: "#fef3c7", color: "#d97706" }, // G, H
  { bg: "#ede9fe", color: "#7c3aed" }, // I, J
  { bg: "#fee2e2", color: "#dc2626" }, // K, L
  { bg: "#e0f2fe", color: "#0284c7" }, // M, N
  { bg: "#f0fdf4", color: "#16a34a" }, // O, P
  { bg: "#fff7ed", color: "#ea580c" }, // Q, R
  { bg: "#fdf4ff", color: "#9333ea" }, // S, T
  { bg: "#ecfdf5", color: "#047857" }, // U, V
  { bg: "#fef2f2", color: "#b91c1c" }, // W, X, Y, Z
];

function getColorFromName(nombre) {
  if (!nombre) return { bg: "#e2e8f0", color: "#64748b" };
  const idx = nombre.trim().toUpperCase().charCodeAt(0) - 65;
  return AVATAR_COLORS[Math.max(0, Math.floor(idx / 2)) % AVATAR_COLORS.length];
}

export function getInitialFromName(nombre) {
  if (!nombre) return "?";
  return nombre.trim()[0].toUpperCase();
}

export default function UserAvatar({ nombre, size = 36, fontSize = "0.875rem", style = {} }) {
  const initial = getInitialFromName(nombre);
  const colors = getColorFromName(nombre);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colors.bg,
        color: colors.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize,
        flexShrink: 0,
        userSelect: "none",
        ...style,
      }}
    >
      {initial}
    </div>
  );
}