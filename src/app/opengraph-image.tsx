import { ImageResponse } from "next/og";
import { getSiteContentForParams } from "@/lib/content";
import { profilePhotoSrc } from "@/lib/media-url";
import { OG_SIZE, ogPortraitDataUrl } from "@/lib/og";

export const alt = "Software engineer — social preview";
export const size = OG_SIZE;
export const contentType = "image/png";
export const runtime = "nodejs";
export const revalidate = 3600;

export default async function OpenGraphImage() {
  const content = await getSiteContentForParams();
  const { profile, social } = content;
  const photo = await ogPortraitDataUrl(profilePhotoSrc(profile, social));
  const host = profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#05070c",
          color: "#f3f6fa",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
              objectPosition: "center 18%",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 720,
            height: 520,
            background: "radial-gradient(circle, rgba(79,187,242,0.22) 0%, transparent 68%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage:
              "linear-gradient(90deg, #05070c 0%, rgba(5,7,12,0.86) 30%, rgba(5,7,12,0.28) 58%, rgba(5,7,12,0.4) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            backgroundImage: "linear-gradient(180deg, rgba(5,7,12,0.08) 0%, rgba(5,7,12,0.18) 45%, rgba(5,7,12,0.58) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 6,
              color: "#4fbbf2",
              textTransform: "uppercase",
            }}
          >
            {profile.title}
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 500,
                letterSpacing: -3,
                lineHeight: 0.9,
              }}
            >
              {profile.firstName}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 88,
                fontWeight: 500,
                letterSpacing: -3,
                lineHeight: 0.9,
                fontFamily: "Georgia, serif",
              }}
            >
              {profile.lastName}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 26,
                color: "#c5ced8",
                letterSpacing: -0.4,
              }}
            >
              React Native · TypeScript · NestJS · AI
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#8b97a6",
            }}
          >
            {host}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
