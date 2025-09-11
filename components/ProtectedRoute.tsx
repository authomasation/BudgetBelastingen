"use client";
import { useEffect, useState, PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/"); // niet ingelogd → naar login
      } else {
        setLoading(false); // ingelogd → laat content zien
      }
    };
    checkSession();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
