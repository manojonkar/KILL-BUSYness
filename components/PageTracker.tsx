"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const supabase = createClient();
    
    const track = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only track page visits for logged-in users

      // Don't track static asset pages or admin routes to keep data clean
      if (
        pathname.startsWith("/_next") || 
        pathname.startsWith("/api") || 
        pathname.startsWith("/admin") ||
        pathname.startsWith("/css") ||
        pathname.startsWith("/img")
      ) {
        return;
      }

      // Log the visit
      await supabase
        .from("page_visits")
        .insert({
          user_id: user.id,
          path: pathname
        });
    };

    track().catch(() => {
      // Fail silently if table does not exist yet
    });
  }, [pathname]);

  return null;
}
