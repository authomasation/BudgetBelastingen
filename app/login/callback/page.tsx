"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Verifiëren...");

  useEffect(() => {
    const verify = async () => {
      // Haal de URL token uit de querystring
      const url = new URL(window.location.href);
      const access_token = url.searchParams.get("access_token");
      const refresh_token = url.searchParams.get("refresh_token");

      if (!access_token) {
        setMessage("Er ging iets mis bij verificatie.");
        return;
      }

      // Store session handmatig
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: refresh_token || undefined,
      });

      if (error) {
        setMessage("Er ging iets mis bij verificatie.");
        console.error(error);
      } else {
        setMessage("Je account is geverifieerd! Je bent ingelogd.");
        console.log("Session:", data.session);
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{message}</p>
    </div>
  );
}
