import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
