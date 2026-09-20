import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#e2e6e1] bg-[#ecefe9] text-[#4b5563] pb-24 md:pb-12 pt-12">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0f5d4a] bg-[#eaf4ef] text-[#0f5d4a]">
                <span className="text-xs font-black">C</span>
              </div>
              <span className="text-lg font-black tracking-tight text-[#0f5d4a]">CIRP</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6b7280]">
              Community Issues Report Platform empowers residents across Akwa Ibom, Uyo, and surrounding neighbourhoods to report, track, and resolve community problems together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e293b]">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#0f5d4a] transition">Home Feed</Link>
              </li>
              <li>
                <Link href="/issues" className="hover:text-[#0f5d4a] transition">Browse Issues</Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#0f5d4a] transition">Interactive Map</Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#0f5d4a] transition">Report an Issue</Link>
              </li>
            </ul>
          </div>

          {/* Issue Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e293b]">Categories</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>Bad Roads & Potholes</li>
              <li>Streetlights & Electricity</li>
              <li>Flooding & Drainage</li>
              <li>Waste Management</li>
              <li>Security & Public Safety</li>
            </ul>
          </div>

          {/* Community & Safety */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e293b]">Safety & Help</h4>
            <p className="mt-3 text-xs text-[#6b7280]">
              Need to report sensitive cases confidentially? Use our anonymous reporting workflow anytime.
            </p>
            <div className="mt-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f5d4a] hover:underline"
              >
                Sign in to your account &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#d8dcd5] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6b7280]">
          <p>© {new Date().getFullYear()} CIRP - Community Issues Report Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-[#0f5d4a]">About CIRP</Link>
            <span className="text-[#cbd5e1]">•</span>
            <span>Privacy Policy</span>
            <span className="text-[#cbd5e1]">•</span>
            <span>Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
