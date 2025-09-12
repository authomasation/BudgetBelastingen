"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthPage from "./AuthPage";

export default function LoginPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) setError(decodeURIComponent(errorParam));

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push("/dashboard");
      else setLoading(false);
    };

    checkSession();
  }, [router, searchParams]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Authentication error: {error}
        </div>
      )}
      <AuthPage />
    </div>
  );
}
