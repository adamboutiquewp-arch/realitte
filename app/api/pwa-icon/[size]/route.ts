import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params;
  const size = sizeParam === "512" ? 512 : 192;
  const fontSize = size === 512 ? 320 : 120;
  const radius = size === 512 ? 100 : 40;

  return new ImageResponse(
    <div
      style={{
        background: "#111111",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius,
      }}
    >
      <span style={{ color: "#E53935", fontSize, fontWeight: 900, lineHeight: 1 }}>R</span>
    </div>,
    { width: size, height: size }
  );
}
