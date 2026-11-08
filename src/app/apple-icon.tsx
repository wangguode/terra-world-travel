import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 512, height: 512 };
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
          borderRadius: "110px",
          border: "4px solid rgba(255, 90, 38, 0.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 背景光晕 */}
        <div
          style={{
            position: "absolute",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 90, 38, 0.28) 0%, rgba(0, 0, 0, 0) 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* 罗盘与经纬仪几何纹理 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "3px dashed rgba(255, 90, 38, 0.7)",
            background: "rgba(255, 90, 38, 0.08)",
            boxShadow: "0 0 40px rgba(255, 90, 38, 0.3)",
          }}
        >
          <div
            style={{
              fontSize: "92px",
              fontWeight: 900,
              color: "#ff5a26",
              letterSpacing: "-2px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            T
          </div>
        </div>

        {/* 底部文字 */}
        <div
          style={{
            marginTop: "32px",
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "8px",
            color: "#ffffff",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          TERRA
        </div>
        <div
          style={{
            marginTop: "6px",
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "4px",
            color: "rgba(255, 255, 255, 0.45)",
            textTransform: "uppercase",
          }}
        >
          Spatial World Model
        </div>
      </div>
    ),
    { ...size }
  );
}
