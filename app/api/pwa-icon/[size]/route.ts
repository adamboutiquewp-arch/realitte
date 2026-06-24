import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import React from "react";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params;
  const size = sizeParam === "512" ? 512 : 192;
  const fontSize = size === 512 ? 320 : 120;

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          background: "#111111",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      React.createElement(
        "span",
        { style: { color: "#E53935", fontSize, fontWeight: 900, lineHeight: 1 } },
        "R"
      )
    ),
    { width: size, height: size }
  );
}
