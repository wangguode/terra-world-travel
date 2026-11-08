import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #18181b 0%, #09090b 100%)",
          borderRadius: "42px",
          border: "2px solid rgba(255, 90, 38, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            border: "2px dashed rgba(255, 90, 38, 0.8)",
            background: "rgba(255, 90, 38, 0.12)",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              fontWeight: 900,
              color: "#ff5a26",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            T
          </div>
        </div>
        <div
          style={{
            marginTop: "10px",
            fontSize: "14px",
            fontWeight: 800,
            letterSpacing: "3px",
            color: "#ffffff",
          }}
        >
          TERRA
        </div>
      </div>
    ),
    { ...size }
  );
}
