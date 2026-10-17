"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function RecoveryCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Supabase auth listener automatically parses the hash fragment 
    // (e.g. #access_token=...) and establishes the session cookies.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
          // The session is now securely in cookies. Redirect to reset page!
          router.push("/auth/reset");
        }
      }
    );

    // Failsafe in case hash is missing or token was invalid
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
          setError("That reset link has expired or already been used. Please request a new one.");
          setTimeout(() => router.push("/forgot"), 3000);
        } else {
          router.push("/auth/reset");
        }
      });
    }, 2000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif", flexDirection: "column" }}>
      {error ? (
        <p style={{ color: "#e11d48", fontWeight: "bold" }}>{error}</p>
      ) : (
        <>
          <p>Verifying secure link...</p>
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: 10 }}>Please wait, you will be redirected momentarily.</p>
        </>
      )}
    </div>
  );
}
