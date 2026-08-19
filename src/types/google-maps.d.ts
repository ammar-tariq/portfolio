export {};

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          el: HTMLElement,
          opts: {
            center: { lat: number; lng: number };
            zoom: number;
            minZoom?: number;
            disableDefaultUI?: boolean;
            zoomControl?: boolean;
            gestureHandling?: string;
            backgroundColor?: string;
            styles?: unknown;
          },
        ) => {
          setCenter: (position: { lat: number; lng: number }) => void;
          setZoom: (zoom: number) => void;
          fitBounds: (bounds: unknown, padding?: number) => void;
        };
        Marker: new (opts: {
          map: unknown;
          position: { lat: number; lng: number };
          title?: string;
        }) => unknown;
        LatLngBounds: new () => {
          extend: (position: { lat: number; lng: number }) => void;
        };
      };
    };
  }
}
