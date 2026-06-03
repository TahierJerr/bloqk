import { ImageResponse } from "next/og";

export const alt = "Bloqk,  Eerlijke boekingssoftware voor kappers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <span
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#171717",
          }}
        >
          bloqk
        </span>
        <span style={{ fontSize: 96, fontWeight: 700, color: "#3538cd" }}>
          .
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#171717",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Boekingssoftware zonder verrassingen.
        </span>
        <span
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#737373",
            maxWidth: 820,
          }}
        >
          Geen commissie. EU-gehost. Een vaste prijs. Voor kappers, barbiers en
          stylisten.
        </span>
      </div>

      <div style={{ display: "flex", fontSize: 26, color: "#737373" }}>
        Gemaakt in Nederland
      </div>
    </div>,
    { ...size },
  );
}
