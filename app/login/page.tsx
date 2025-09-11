"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthPage from "./AuthPage";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/"); // redirect naar home
      } else {
        setLoading(false); // laat AuthPage zien
      }
    };
    checkSession();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  return <AuthPage />;
}
