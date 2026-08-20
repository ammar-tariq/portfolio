"use client";

import { useEffect, useRef, useState } from "react";

type Point = { city: string; country?: string; lat?: number; lng?: number; count: number };

const DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1c1f24" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1c1f24" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b919a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a4048" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9aa3ad" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#22262c" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1218" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4b5560" }] },
];

let mapsPromise: Promise<void> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Maps needs a browser."));
  if (window.google?.maps?.Map) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-google-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => {
          mapsPromise = null;
          reject(new Error("Maps script failed to load."));
        },
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "1";
    script.onload = () => resolve();
    script.onerror = () => {
      mapsPromise = null;
      reject(new Error("Maps script failed to load. Check the key, Maps JavaScript API, billing, and HTTP referrers."));
    };
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export function VisitorMap({ points, apiKey }: { points: Point[]; apiKey: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState("");
  const dots = points.filter((point) => typeof point.lat === "number" && typeof point.lng === "number");
  const dotsKey = dots.map((point) => `${point.city}:${point.lat}:${point.lng}:${point.count}`).join("|");
  const error = apiKey ? loadError : "Add GOOGLE_MAPS_API_KEY to .env and restart npm run dev.";

  useEffect(() => {
    if (!apiKey) return;
    const mapped = points.filter((point) => typeof point.lat === "number" && typeof point.lng === "number");
    let cancelled = false;
    void loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !el.current || !window.google?.maps?.Map) return;
        const map = new window.google.maps.Map(el.current, {
          center: { lat: 20, lng: 12 },
          zoom: 2,
          minZoom: 2,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#0e1218",
          styles: DARK_STYLES,
        });
        const bounds = new window.google.maps.LatLngBounds();
        for (const point of mapped) {
          const position = { lat: point.lat as number, lng: point.lng as number };
          new window.google.maps.Marker({
            map,
            position,
            title: `${point.city || point.country || "Unknown"} (${point.count})`,
          });
          bounds.extend(position);
        }
        if (mapped.length === 1) {
          map.setCenter({ lat: mapped[0]?.lat as number, lng: mapped[0]?.lng as number });
          map.setZoom(6);
        } else if (mapped.length > 1) {
          map.fitBounds(bounds, 64);
        }
      })
      .catch((cause) => {
        if (!cancelled) setLoadError(cause instanceof Error ? cause.message : "Maps failed to load.");
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, dotsKey, points]);

  return (
    <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-xl border border-line bg-bg">
      <div ref={el} className="h-full min-h-72 w-full" />
      {error ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted">
          {error}
        </p>
      ) : null}
      {!error && dots.length === 0 ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 px-6 text-center text-sm text-muted">
          No public-IP city dots yet. Localhost and Docker IPs cannot be placed on the map.
        </p>
      ) : null}
    </div>
  );
}
