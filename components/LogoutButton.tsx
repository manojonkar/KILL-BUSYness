"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} style={{ marginLeft: "4px", padding: '6px 14px', fontSize: '0.8rem', color: 'white', backgroundColor: 'transparent', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}>
      Logout
    </button>
  );
}
