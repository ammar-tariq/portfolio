import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";

export const alt = "Portfolio — social preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const content = await getSiteContent();
  const { profile } = content;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#05070c",
          color: "#f3f6fa",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            color: "#4fbbf2",
            textTransform: "uppercase",
          }}
        >
          {profile.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 500, letterSpacing: -2 }}>{profile.name}</div>
          <div style={{ fontSize: 28, color: "#a8b3c2", marginTop: 18 }}>
            React Native · TypeScript · NestJS · AI
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#7d8a9a" }}>
          {profile.website.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size },
  );
}
