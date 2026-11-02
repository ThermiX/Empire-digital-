import { ImageResponse } from "next/og";

export const alt = "Argent Clair — Votre argent, enfin clair.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 10%, #124E30 0%, #04180C 55%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "#E4FF1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, border: "6px solid #04180C" }} />
          </div>
          Argent <span style={{ color: "#9FB8A8", fontWeight: 500, marginLeft: 10 }}>Clair</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Votre argent,</div>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, color: "#E4FF1A" }}>enfin clair.</div>
          <div style={{ fontSize: 30, color: "#9FB8A8", marginTop: 28 }}>
            Simulateur de budget, académie et guides gratuits — en FCFA.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
