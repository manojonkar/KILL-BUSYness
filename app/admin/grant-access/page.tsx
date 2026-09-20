import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import GrantAccessClient from "./GrantAccessClient";

export default async function AdminGrantAccessPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only admin can access
  if (user.email !== "manojonkar@gmail.com") redirect("/home");

  return (
    <>
      <Header />
      <main>
        <div className="section-head">
          <span className="eyebrow">Admin</span>
          <h2>Grant Access</h2>
          <p>Manually grant portal access to users who purchased the book externally.</p>
        </div>
        <GrantAccessClient />
      </main>
    </>
  );
}
