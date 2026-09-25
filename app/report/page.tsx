"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MAX_IMAGE_SIZE_BYTES, MAX_ISSUE_IMAGES, createIssueEntry, formatLocation, supabase } from "@/lib/supabase";

const DEFAULT_COORDS = { lat: 5.037, lng: 7.926 };

export default function ReportPage() {
    const router = useRouter();
    const formatCoords = (coords: { lat: number; lng: number }) => `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [locationAddress, setLocationAddress] = useState("");
    const [location, setLocation] = useState(formatCoords(DEFAULT_COORDS));
    const [contactInfo, setContactInfo] = useState("");
    const [anonymous, setAnonymous] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedLocation, setSelectedLocation] = useState(DEFAULT_COORDS);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    // Detect if user is logged in — require auth for reporting
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUserId(session?.user?.id ?? null);
        };
        void checkAuth();
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
        });
        return () => { authListener.subscription.unsubscribe(); };
    }, []);

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);

    const photoCount = useMemo(() => selectedFiles.length, [selectedFiles]);
    const previewUrls = useMemo(() => selectedFiles.slice(0, MAX_ISSUE_IMAGES).map((file) => URL.createObjectURL(file)), [selectedFiles]);

    const applyCoordsToLocation = (coords: { lat: number; lng: number }) => {
        const formatted = formatCoords(coords);
        setSelectedLocation(coords);
        setLocation(formatted);
    };

    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const buildMarkerElement = () => {
        const el = document.createElement("div");
        el.style.position = "relative";
        el.style.width = "28px";
        el.style.height = "34px";
        el.style.cursor = "grab";
        el.innerHTML = `
      <div style="position: relative; width: 28px; height: 34px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 384 512" width="28" height="34" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
          <path fill="#ef4444" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
          <circle cx="192" cy="192" r="82" fill="#ffffff"/>
        </svg>
      </div>
    `;
        return el;
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
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: createMapStyle("standard"),
            center: [DEFAULT_COORDS.lng, DEFAULT_COORDS.lat],
            zoom: 12.7,
            attributionControl: {},
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        requestAnimationFrame(() => map.resize());

        const marker = new maplibregl.Marker({ draggable: true, element: buildMarkerElement(), anchor: "bottom" })
            .setLngLat([DEFAULT_COORDS.lng, DEFAULT_COORDS.lat])
            .addTo(map);

        marker.on("dragend", () => {
            const point = marker.getLngLat();
            applyCoordsToLocation({ lat: point.lat, lng: point.lng });
        });

        mapRef.current = map;
        markerRef.current = marker;
        applyCoordsToLocation(DEFAULT_COORDS);

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported in this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                if (mapRef.current) {
                    mapRef.current.flyTo({ center: [coords.lng, coords.lat], zoom: 15, speed: 1.5 });
                }
                if (markerRef.current) {
                    markerRef.current.setLngLat([coords.lng, coords.lat]);
                }
                applyCoordsToLocation(coords);
            },
            () => {
                alert("We could not access your location. Please drag the map pin to the correct place instead.");
            }
        );
    };

    const zoomInMap = () => {
        if (mapRef.current) mapRef.current.zoomIn();
    };

    const zoomOutMap = () => {
        if (mapRef.current) mapRef.current.zoomOut();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const nextFiles = Array.from(event.target.files ?? []);
        if (!nextFiles.length) return;

        const validFiles = nextFiles.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
        const accepted = validFiles.slice(0, MAX_ISSUE_IMAGES);

        if (accepted.length !== nextFiles.length) {
            setErrorMessage("Each image must be 5MB or smaller.");
        } else {
            setErrorMessage("");
        }

        setSelectedFiles((prev) => {
            const merged = [...prev, ...accepted].slice(0, MAX_ISSUE_IMAGES);
            return merged;
        });

        event.target.value = "";
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!userId) {
            setErrorMessage("Please log in to report an issue. You can still report anonymously to hide your identity.");
            return;
        }

        if (!title.trim() || !category || !description.trim() || !locationAddress.trim()) {
            setErrorMessage("Please complete the required fields before submitting.");
            return;
        }

        if (selectedFiles.length > MAX_ISSUE_IMAGES) {
            setErrorMessage(`Please upload no more than ${MAX_ISSUE_IMAGES} images.`);
            return;
        }

        setIsSubmitting(true);

        try {
            const issue = await createIssueEntry({
                title,
                category,
                description,
                location: formatLocation(locationAddress, location),
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                contactInfo,
                anonymous,
                files: selectedFiles,
            });

            setSuccessMessage("Issue submitted successfully.");
            router.push(`/issues/${issue.id}?submitted=1`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to submit issue.";
            setErrorMessage(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f5f3] text-[#0f172a]">
            <Navbar />

            <main className="mx-auto w-full max-w-[860px] flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-0">
                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                    <nav className="flex flex-wrap items-center gap-1 text-xs text-[#64748b] sm:text-sm">
                        <Link href="/" className="transition hover:text-[#0f5d4a]">Home</Link>
                        <span className="text-[#94a3b8]">&nbsp;&gt;&nbsp;</span>
                        <span className="font-medium text-[#0f172a]">Report an Issue</span>
                    </nav>
                    <span className="text-xs font-medium text-[#64748b]">Required fields</span>
                </div>

                <div className="rounded-[18px] border border-[#e2e6e1] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)] sm:p-6 lg:p-7">
                    <h1 className="text-[clamp(1.7rem,2vw,2.2rem)] font-black tracking-tight text-[#0f172a]">Report an Issue</h1>

                    {errorMessage && (<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>)}
                    {successMessage && (<div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>)}

                    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="title" className="mb-2 block text-sm font-semibold text-[#0f172a]">Issue Title <span className="text-[#ef4444]">*</span></label>
                            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bad road with large potholes" className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3.5 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15" />
                        </div>

                        <div>
                            <label htmlFor="category" className="mb-2 block text-sm font-semibold text-[#0f172a]">Category <span className="text-[#ef4444]">*</span></label>
                            <div className="relative">
                                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3.5 py-3 pr-10 text-sm text-[#0f172a] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15">
                                    <option value="">Select a category</option>
                                    <option>Bad Road / Pothole</option>
                                    <option>Broken Streetlight</option>
                                    <option>Flooding</option>
                                    <option>Waste Disposal</option>
                                    <option>Water Shortage</option>
                                    <option>Power / Electricity</option>
                                    <option>Security Concern</option>
                                    <option>Others</option>
                                </select>
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#64748b]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                                </span>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="mb-2 block text-sm font-semibold text-[#0f172a]">Description <span className="text-[#ef4444]">*</span></label>
                            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide more details about the issue..." className="w-full resize-none rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3.5 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15" />
                        </div>

                        <div>
                            <label htmlFor="locationAddress" className="mb-2 block text-sm font-semibold text-[#0f172a]">Location Address <span className="text-[#ef4444]">*</span></label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input id="locationAddress" type="text" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="e.g. No. 29 Street, Uyo" className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3.5 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15" />
                                <button type="button" onClick={handleDetectLocation} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfe3d8] bg-[#eaf4ef] px-3 py-3 text-sm font-semibold text-[#0f5d4a] transition hover:bg-[#dfeee8]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                    Detect My Location
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="locationCoords" className="mb-2 block text-sm font-semibold text-[#64748b]">GPS Coordinates <span className="text-xs font-normal text-[#94a3b8]">(auto-detected from map pin)</span></label>
                            <input id="locationCoords" type="text" value={location} readOnly className="w-full cursor-not-allowed rounded-xl border border-[#d8dcd6] bg-[#f0f0ee] px-3.5 py-3 text-sm text-[#64748b] outline-none" />
                        </div>

                        <div className="rounded-2xl border border-[#dfe4de] bg-[#f3f6f3] p-2 sm:p-3">
                            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#64748b]">
                                <button type="button" className="rounded-lg border border-[#d5dad3] bg-white px-2 py-1 text-[#0f172a]">Map</button>
                                <button type="button" className="rounded-lg px-2 py-1 text-[#64748b]">Satellite</button>
                            </div>

                            <div className="relative overflow-hidden rounded-xl border border-[#dfe4de] bg-[#ebefeb]">
                                <div ref={mapContainerRef} className="h-[220px] w-full" />
                                <div className="pointer-events-none absolute left-3 top-3 z-[450] rounded-full border border-[#d9ddd8] bg-white/90 px-2 py-1 text-[10px] font-medium text-[#374151] shadow-sm">Drag pin to adjust</div>
                                <div className="absolute right-3 top-3 z-[450] flex flex-col gap-2">
                                    <button type="button" onClick={zoomInMap} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9ddd8] bg-white text-lg font-medium text-[#374151] shadow-sm transition hover:bg-[#f4f5f3]" aria-label="Zoom in">+</button>
                                    <button type="button" onClick={zoomOutMap} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9ddd8] bg-white text-lg font-medium text-[#374151] shadow-sm transition hover:bg-[#f4f5f3]" aria-label="Zoom out">−</button>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-col gap-1 text-xs text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
                                <p>Drag the pin to the exact location of the issue.</p>
                                <span className="font-medium text-[#0f5d4a]">{formatCoords(selectedLocation)}</span>
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-[#0f172a]">Photos / Upload <span className="text-[#ef4444]">*</span></label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <label className="flex min-h-[112px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-[#d8dcd6] bg-[#f8faf8] text-center text-[#64748b] transition hover:border-[#0f5d4a] hover:bg-[#eef5f1]">
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                                    <div className="flex flex-col items-center gap-2 px-4 py-4">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d5dad3] bg-white text-lg text-[#0f5d4a]">⤴</span>
                                        <span className="text-xs font-medium text-[#475569]">Upload image</span>
                                    </div>
                                </label>

                                {previewUrls.slice(0, 2).map((url, index) => (
                                    <div key={`${url}-${index}`} className="relative overflow-hidden rounded-2xl border border-[#dfe4de] bg-[#e6eae6] shadow-sm">
                                        <img src={url} alt={`Issue upload ${index + 1}`} className="h-[112px] w-full object-cover" />
                                    </div>
                                ))}

                                {selectedFiles.length === 0 && <div className="rounded-2xl border border-[#dfe4de] bg-[#e6eae6]" />}
                            </div>
                            <p className="mt-2 text-xs text-[#64748b]">PNG, JPG up to 5MB each. Up to {MAX_ISSUE_IMAGES} images.</p>
                            <p className="mt-1 text-xs text-[#64748b]">Selected files: {photoCount}</p>
                        </div>

                        <div>
                            <label htmlFor="contact" className="mb-2 block text-sm font-semibold text-[#0f172a]">Contact Info <span className="text-[#64748b] font-medium">(Optional)</span></label>
                            <input id="contact" type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Email address or phone number" className="w-full rounded-xl border border-[#d8dcd6] bg-[#f9faf9] px-3.5 py-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#0f5d4a] focus:bg-white focus:ring-2 focus:ring-[#0f5d4a]/15" />
                        </div>

                        <div className="rounded-xl border border-[#dfe4de] bg-[#f9faf9] p-3">
                            <label className="flex items-start gap-3 text-sm text-[#334155]">
                                <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-[#cbd5e1] text-[#0f5d4a] focus:ring-[#0f5d4a]/20" />
                                <span>
                                    <span className="font-semibold">Report anonymously</span>
                                    <span className="mt-0.5 block text-xs text-[#64748b]">Your identity will be hidden from the public report, but your account is still linked for follow-up.</span>
                                </span>
                            </label>
                        </div>

                        {!userId && (
                            <div className="rounded-xl border border-[#ee7c2d]/30 bg-[#fff8f2] p-3 text-sm text-[#9a4b13]">
                                You need to be signed in to report an issue. <Link href="/login" className="font-semibold underline hover:text-[#d76a1a]">Log in</Link> or <Link href="/register" className="font-semibold underline hover:text-[#d76a1a]">create an account</Link>.
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting || !userId} className="mt-2 w-full rounded-xl bg-[#0f5d4a] px-4 py-3 text-base font-bold text-white shadow-[0_10px_20px_rgba(15,93,74,0.18)] transition hover:bg-[#0b4d3e] active:scale-[0.99] disabled:opacity-60">
                            {isSubmitting ? "Submitting..." : !userId ? "Log in to submit" : "Submit Issue"}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
