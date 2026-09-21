"use client";

import { usePathname } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";

const hiddenRoutes = ["/login", "/register"];

export default function MobileNavController() {
    const pathname = usePathname();

    const shouldHide = hiddenRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (shouldHide) return null;

    return <MobileBottomNav />;
}
