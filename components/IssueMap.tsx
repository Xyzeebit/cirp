"use client";

import React, { useEffect, useRef, useState } from "react";

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
  { pinColor: string; bg: string; text: string; icon: string }
> = {
  "Bad Road / Pothole": {
    pinColor: "#ef4444", // red
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "🕳️",
  },
  "Broken Streetlight": {
    pinColor: "#f59e0b", // yellow / amber
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: "💡",
  },
  "Flooding": {
    pinColor: "#10b981", // green
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "🌊",
  },
  "Waste Disposal": {
    pinColor: "#059669", // dark green
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: "🗑️",
  },
  "Water Shortage": {
    pinColor: "#3b82f6", // blue
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: "💧",
  },
  "Power / Electricity": {
    pinColor: "#eab308", // golden yellow
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    icon: "⚡",
  },
  "Security Concern": {
    pinColor: "#dc2626", // deep red
    bg: "bg-red-50",
    text: "text-red-700",
    icon: "🚨",
  },
  "Others": {
    pinColor: "#8b5cf6", // purple
    bg: "bg-purple-50",
    text: "text-purple-700",
    icon: "📌",
  },
};

interface IssueMapProps {
  issues: MapIssue[];
  selectedIssue: MapIssue | null;
  onSelectIssue: (issue: MapIssue | null) => void;
  onUpvote: (id: string) => void;
  userUpvoted: Record<string, boolean>;
}

export default function IssueMap({
  issues,
  selectedIssue,
  onSelectIssue,
  onUpvote,
  userUpvoted,
}: IssueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const tileLayerRef = useRef<any>(null);

  // Initialize Leaflet Map dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet Script
    const loadScript = () => {
      if ((window as any).L) {
        initMap((window as any).L);
        return;
      }

      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          if ((window as any).L) {
            initMap((window as any).L);
          }
        };
        document.body.appendChild(script);
      } else {
        const checkInterval = setInterval(() => {
          if ((window as any).L) {
            clearInterval(checkInterval);
            initMap((window as any).L);
          }
        }, 100);
      }
    };

    const initMap = (L: any) => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Enugu center: 6.4474, 7.5140, zoom: 13
      const map = L.map(mapContainerRef.current, {
        center: [6.4474, 7.514],
        zoom: 13,
        zoomControl: false, // custom controls positioned on bottom right
      });

      // Free OpenStreetMap tiles to keep the same light, clean UI without a paid basemap.
      const standardTile = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: "abc",
          maxZoom: 19,
        }
      ).addTo(map);

      tileLayerRef.current = standardTile;
      mapInstanceRef.current = map;
      setMapLoaded(true);

      map.on("click", (e: any) => {
        // If clicking on map background, deselect active issue
        if (e.originalEvent.target.classList.contains("leaflet-container")) {
          onSelectIssue(null);
        }
      });
    };

    loadScript();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when issues change
  useEffect(() => {
    const L = (window as any).L;
    if (!mapLoaded || !mapInstanceRef.current || !L) return;

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Plot markers
    issues.forEach((issue) => {
      const catConfig = CATEGORY_COLORS[issue.category] || CATEGORY_COLORS["Others"];
      const isSelected = selectedIssue?.id === issue.id;

      // Custom SVG Pin icon matching UI/map.png
      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position: relative; width: 34px; height: 42px; transform: translate(-50%, -100%); cursor: pointer; transition: transform 0.2s ease;">
            <svg viewBox="0 0 384 512" width="34" height="42" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
              <path fill="${catConfig.pinColor}" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
              <circle cx="192" cy="192" r="82" fill="#ffffff"/>
            </svg>
            <div style="position: absolute; top: 7px; left: 0; right: 0; display: flex; justify-content: center; font-size: 13px;">
              ${catConfig.icon}
            </div>
            ${isSelected
            ? `<div style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; background: #0f5d4a; border-radius: 9999px; border: 2px solid white;"></div>`
            : ""
          }
          </div>
        `,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
      });

      const marker = L.marker([issue.lat, issue.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        onSelectIssue(issue);
        map.panTo([issue.lat, issue.lng], { animate: true });
      });

      markersRef.current.push(marker);
    });
  }, [issues, mapLoaded, selectedIssue]);

  // Pan to selected issue if changed externally
  useEffect(() => {
    if (selectedIssue && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedIssue.lat, selectedIssue.lng], {
        animate: true,
      });
    }
  }, [selectedIssue]);

  // Zoom handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Detect location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && (window as any).L) {
          const L = (window as any).L;
          mapInstanceRef.current.setView([latitude, longitude], 15);

          // Add pulsing user location marker
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: `
              <div style="position: relative; width: 22px; height: 22px; transform: translate(-50%, -50%);">
                <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: #0f5d4a; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: #0f5d4a; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></span>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          L.marker([latitude, longitude], { icon: userIcon }).addTo(
            mapInstanceRef.current
          );
        }
      },
      () => {
        // Fallback default: center on Enugu GRA
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([6.452, 7.51], 15);
        }
      }
    );
  };

  // Toggle map layer (standard / satellite)
  const toggleMapLayer = () => {
    const L = (window as any).L;
    if (!mapInstanceRef.current || !L) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    if (mapType === "standard") {
      // Switch to Satellite
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 18,
        }
      ).addTo(mapInstanceRef.current);

      tileLayerRef.current = satLayer;
      setMapType("satellite");
    } else {
      // Switch back to the free standard OpenStreetMap view.
      const standardTile = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: "abc",
          maxZoom: 19,
        }
      ).addTo(mapInstanceRef.current);

      tileLayerRef.current = standardTile;
      setMapType("standard");
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e8ece7]">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Floating Map Controls (Right Side, as in UI/map.png) */}
      <div className="absolute right-4 top-4 z-20 flex flex-col items-center gap-2">
        {/* Layer / Settings Toggle Button with notification badge */}
        <button
          type="button"
          onClick={toggleMapLayer}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8dcd6] bg-white text-[#374151] shadow-md transition hover:bg-[#f4f5f3] hover:text-[#0f5d4a] active:scale-95"
          title={`Switch to ${mapType === "standard" ? "Satellite" : "Street"} View`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>

      {/* Bottom Right Controls (+, -, Detect Location) */}
      <div className="absolute right-4 bottom-20 md:bottom-8 z-20 flex flex-col items-center gap-2">
        <div className="flex flex-col overflow-hidden rounded-xl border border-[#d8dcd6] bg-white shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-10 w-10 items-center justify-center border-b border-[#e5e8e3] text-lg font-bold text-[#374151] hover:bg-[#f4f5f3] hover:text-[#0f5d4a] active:bg-gray-100"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-10 w-10 items-center justify-center text-lg font-bold text-[#374151] hover:bg-[#f4f5f3] hover:text-[#0f5d4a] active:bg-gray-100"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        {/* GPS Location Finder Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8dcd6] bg-white text-[#374151] shadow-md transition hover:bg-[#f4f5f3] hover:text-[#0f5d4a] active:scale-95"
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

      {/* Selected Issue Floating Preview Card */}
      {selectedIssue && (
        <div className="absolute left-4 right-4 md:left-auto md:right-20 bottom-24 md:bottom-8 z-30 max-w-sm rounded-2xl border border-[#e2e6e1] bg-white p-4 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
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
              <span className="text-[0.72rem] text-[#64748b]">
                {selectedIssue.time}
              </span>
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
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-[#0f172a] truncate">
                {selectedIssue.title}
              </h4>
              <p className="mt-0.5 text-xs text-[#525d6f] flex items-center gap-1">
                <span>📍</span>
                <span className="truncate">{selectedIssue.location}</span>
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[#64748b]">
                <button
                  type="button"
                  onClick={() => onUpvote(selectedIssue.id)}
                  className={`flex items-center gap-1 ${userUpvoted[selectedIssue.id]
                      ? "text-red-600 font-bold"
                      : "hover:text-red-500"
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
        </div>
      )}
    </div>
  );
}
