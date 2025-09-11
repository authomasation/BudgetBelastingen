"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function Footer() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // luister naar login/logout
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center p-20">
      {user ? (
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/settings"
        >
          <Image
            aria-hidden
            src="/settings.svg"
            alt="settings icon"
            width={16}
            height={16}
          />
          {user.user_metadata?.name || user.email}
        </a>
      ) : (
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/"
        >
          <Image
            aria-hidden
            src="/login.svg"
            alt="login icon"
            width={16}
            height={16}
          />
          Login
        </a>
      )}
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="/contact"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/contact.svg"
          alt="contact icon"
          width={16}
          height={16}
        />
        Contact
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="/disclaimer"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/disclaimer.svg"
          alt="disclaimer icon"
          width={16}
          height={16}
        />
        Disclaimer
      </a>
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/btw_aangifte_doen_en_betalen/btw-aangifte-waar-moet-u-aan-denken/hoe-btw-aangifte-invullen-en-versturen"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/bld_logo.png"
          alt="Belastingdienst logo"
          width={16}
          height={16}
        />
        Doe hier uw aangifte →
      </a>
    </footer>
  );
}
