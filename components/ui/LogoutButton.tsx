// components/LogoutButton.tsx  (client component)
"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      return;
    }
    // Redirect naar login
    router.push("/");
  };

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Afmelden
    </Button>
  );
}
