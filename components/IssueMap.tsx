"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapIssue {
  id: string;
  title: string;
  category:
  | "Bad Road / Pothole"
  | "Broken Streetlight"
  | "Flooding"
  | "Waste Disposal"
  | "Water Shortage"
  | "Power / Electricity"
  | "Security Concern"
  | "Others";
  location: string;
  lat: number;
  lng: number;
  status: "Submitted" | "Under Review" | "Resolved";
  time: string;
  votes: number;
  comments: number;
  image: string;
}

export const CATEGORY_COLORS: Record<
  MapIssue["category"],
  { pinColor: string; bg: string; text: string; icon: string; svg: string }
> = {
  "Bad Road / Pothole": {
    pinColor: "#ef4444",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "Pothole",
    svg: '<path d="M12 3C8 3 5 6 5 10c0 3 2 5 3 7 1 2 2 3 4 3s3-1 4-3c1-2 3-4 3-7 0-4-3-7-7-7zm0 3a3 3 0 0 1 3 3c0 1.5-1.5 2.5-3 2.5S9 10.5 9 9a3 3 0 0 1 3-3z"/>',
  },
  "Broken Streetlight": {
    pinColor: "#f59e0b",
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "Streetlight",
    svg: '<path d="M12 2a1 1 0 0 1 1 1v2h3a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3h-1v3h4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2h4v-3H9a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1h4V3a1 1 0 0 1 1-1zm4 4H8v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6z"/>',
  },
  "Flooding": {
    pinColor: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "Flooding",
    svg: '<path d="M2 18c1 0 1.5-1 2-1s1 1 2 1 1.5-1 2-1 1 1 2 1 1.5-1 2-1 1 1 2 1 1.5-1 2-1 1 1 2 1v2c-1 0-1.5 1-2 1s-1-1-2-1-1.5 1-2 1-1-1-2-1-1.5 1-2 1-1-1-2-1-1.5 1-2 1-1-1-2-1v-2zm0-5c1 0 1.5-1 2-1s1 1 2 1 1.5-1 2-1 1 1 2 1 1.5-1 2-1 1 1 2 1 1.5-1 2-1 1 1 2 1v2c-1 0-1.5 1-2 1s-1-1-2-1-1.5 1-2 1-1-1-2-1-1.5 1-2 1-1-1-2-1-1.5 1-2 1-1-1-2-1v-2zM5 8a7 7 0 1 1 14 0c0 2-1 3-2 3s-2-1-2-3a3 3 0 0 0-6 0c0 2-1 3-2 3s-2-1-2-3z"/>',
  },
  "Waste Disposal": {
    pinColor: "#059669",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "Waste",
    svg: '<path d="M9 3h6a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3V4a1 1 0 0 1 1-1zm1 2v1h4V5H10zm-2 4v10h8V9H8zm2 1a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0v-6a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v6a1 1 0 0 1-2 0v-6a1 1 0 0 1 1-1z"/>',
  },
  "Water Shortage": {
    pinColor: "#3b82f6",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "Water Drop",
    svg: '<path d="M12 2S6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12zm0 18a4 4 0 0 1-4-4c0-.5.2-1.2.5-2 .5 1.5 2 2.5 3.5 2.5a3.5 3.5 0 0 0 3.5-3c.3.8.5 1.7.5 2.5a4 4 0 0 1-4 4z"/>',
  },
  "Power / Electricity": {
    pinColor: "#eab308",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    icon: "Power",
    svg: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
  },
  "Security Concern": {
    pinColor: "#dc2626",
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "Security",
    svg: '<path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3zm0 4l6 2v5c0 3.5-2.5 7-6 8.5C8.5 20 6 16.5 6 13V8l6-2zm-1 4a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1zm0 6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>',
  },
  "Others": {
    pinColor: "#8b5cf6",
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "Pin",
    svg: '<path d="M12 2C7.6 2 4 5.6 4 10c0 4.4 8 12 8 12s8-7.6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>',
  },
};

interface IssueMapProps {
  issues: MapIssue[];
  selectedIssue: MapIssue | null;
  onSelectIssue: (issue: MapIssue | null) => void;
  onUpvote: (id: string) => void;
  userUpvoted: Record<string, boolean>;
  searchLocation?: string;
}

export default function IssueMap({
  issues,
  selectedIssue,
  onSelectIssue,
  onUpvote,
  userUpvoted,
  searchLocation,
}: IssueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onSelectIssueRef = useRef(onSelectIssue);
  useEffect(() => {
    onSelectIssueRef.current = onSelectIssue;
  }, [onSelectIssue]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  const buildPin = (color: string, isSelected: boolean, svgPath: string) => {
    const element = document.createElement("div");
    element.style.position = "relative";
    element.style.width = "34px";
    element.style.height = "42px";
    element.style.cursor = "pointer";
    element.innerHTML = `
      <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 384 512" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path fill="${color}" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
          <circle cx="192" cy="192" r="82" fill="#ffffff"/>
        </svg>
        <svg viewBox="0 0 24 24" width="22" height="22" style="position:absolute;top:9px;left:50%;transform:translateX(-50%);fill:${color};stroke:none;">
          ${svgPath}
        </svg>
        ${isSelected ? '<div style="position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:#0f5d4a;border-radius:9999px;border:2px solid white;"></div>' : ""}
      </div>
    `;
    return element;
  };

  const createMapStyle = (mode: "standard" | "satellite") => ({
    version: 8 as const,
    name: mode === "standard" ? "OpenStreetMap" : "Satellite",
    sources: {
      tiles: {
        type: "raster" as const,
        tiles:
          mode === "standard"
            ? [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ]
            : [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
        tileSize: 256,
        attribution:
          mode === "standard"
            ? "&copy; OpenStreetMap contributors"
            : "&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      },
    },
    layers: [{ id: "base-layer", type: "raster" as const, source: "tiles", paint: {} }],
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: createMapStyle("standard"),
      center: [7.514, 5.037],
      zoom: 12.3,
      attributionControl: {},
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapInstanceRef.current = map;
    setMapLoaded(true);
    requestAnimationFrame(() => map.resize());

    map.on("click", (event: maplibregl.MapMouseEvent) => {
      const target = event.originalEvent?.target as HTMLElement | undefined;
      if (target && target.classList && target.classList.contains("maplibregl-canvas")) {
        onSelectIssueRef.current(null);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!mapLoaded || !map || !mapContainerRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    issues.forEach((issue) => {
      const config = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS["Others"];
      const isSelected = selectedIssue?.id === issue.id;
      const marker = new maplibregl.Marker({
        element: buildPin(config.pinColor, isSelected, config.svg),
        anchor: "bottom",
      })
        .setLngLat([issue.lng, issue.lat])
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        onSelectIssue(issue);
        map.flyTo({ center: [issue.lng, issue.lat], zoom: 14, speed: 1.6 });
      });

      markersRef.current.push(marker);
    });
  }, [issues, mapLoaded, selectedIssue, onSelectIssue]);

  useEffect(() => {
    if (selectedIssue && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [selectedIssue.lng, selectedIssue.lat],
        zoom: 14,
        speed: 1.4,
      });
    }
  }, [selectedIssue]);

  // Geocode search location and fly the map there
  useEffect(() => {
    const query = searchLocation?.trim();
    if (!query || !mapInstanceRef.current) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          { signal: controller.signal, headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          mapInstanceRef.current?.flyTo({
            center: [parseFloat(lon), parseFloat(lat)],
            zoom: 13,
            speed: 1.2,
          });
        }
      } catch {
        // silently ignore — user may see "0 found" in the UI
      }
    }, 600);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchLocation]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [longitude, latitude], zoom: 15, speed: 1.4 });
        }
      },
      () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo({ center: [7.926, 5.037], zoom: 15, speed: 1.4 });
        }
      }
    );
  };

  const toggleMapLayer = () => {
    if (!mapInstanceRef.current) return;

    const nextType = mapType === "standard" ? "satellite" : "standard";
    mapInstanceRef.current.setStyle(createMapStyle(nextType));
    setMapType(nextType);
    requestAnimationFrame(() => mapInstanceRef.current?.resize());
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e8ece7]">
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      <div className="absolute right-4 top-4 z-20 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={toggleMapLayer}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/30 text-[#374151] shadow-[0_8px_30px_rgba(15,16,19,0.08)] backdrop-blur-xl transition hover:bg-white/50 hover:text-[#0f5d4a] active:scale-95"
          title={`Switch to ${mapType === "standard" ? "Layer" : "Street"} View`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>

      <div className="absolute right-4 bottom-20 md:bottom-8 z-20 flex flex-col items-center gap-2">
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/50 bg-white/30 shadow-[0_8px_30px_rgba(15,16,19,0.08)] backdrop-blur-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-10 w-10 items-center justify-center border-b border-white/40 text-lg font-bold text-[#374151] hover:bg-white/40 hover:text-[#0f5d4a] active:bg-white/60"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-10 w-10 items-center justify-center text-lg font-bold text-[#374151] hover:bg-white/40 hover:text-[#0f5d4a] active:bg-white/60"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/30 text-[#374151] shadow-[0_8px_30px_rgba(15,16,19,0.08)] backdrop-blur-xl transition hover:bg-white/50 hover:text-[#0f5d4a] active:scale-95"
          title="Detect My Location"
          aria-label="Detect My Location"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>
      </div>

      {selectedIssue && (
        <div className="absolute left-4 right-4 md:left-auto md:right-20 bottom-24 md:bottom-8 z-30 max-w-sm rounded-[22px] border border-white/50 bg-white/30 p-4 shadow-[0_20px_60px_rgba(15,16,19,0.08)] backdrop-blur-xl transition-all duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-md px-2 py-0.5 text-[0.68rem] font-bold ${selectedIssue.status === "Submitted"
                  ? "bg-[#feece2] text-[#d96515]"
                  : selectedIssue.status === "Under Review"
                    ? "bg-[#fef3c7] text-[#b45309]"
                    : "bg-[#dcfce7] text-[#15803d]"
                  }`}
              >
                {selectedIssue.status}
              </span>
              <span className="text-[0.72rem] text-[#64748b]">{selectedIssue.time}</span>
            </div>

            <button
              type="button"
              onClick={() => onSelectIssue(null)}
              className="text-[#9ca3af] hover:text-[#4b5563] p-1"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>

          <div className="mt-2 flex gap-3">
            <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
              <img
                src={selectedIssue.image}
                alt={selectedIssue.title}
                className={`h-full w-full ${selectedIssue.image.includes("logo.svg") ? "object-contain p-2 bg-[#fff8f3]" : "object-cover"}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#0f172a] truncate">{selectedIssue.title}</h4>
              <p className="mt-0.5 text-xs text-[#525d6f] flex items-center gap-1">
                <span>📍</span>
                <span className="truncate">{selectedIssue.location}</span>
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[#64748b]">
                <button
                  type="button"
                  onClick={() => onUpvote(selectedIssue.id)}
                  className={`flex items-center gap-1 ${userUpvoted[selectedIssue.id] ? "text-red-600 font-bold" : "hover:text-red-500"
                    }`}
                >
                  <span>♡</span>
                  <span>{selectedIssue.votes}</span>
                </button>
                <span className="flex items-center gap-1">
                  <span>💬</span>
                  <span>{selectedIssue.comments}</span>
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/issues/${selectedIssue.id}`}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,#ee7c2d,#d76a1a)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
          >
            View full details
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
