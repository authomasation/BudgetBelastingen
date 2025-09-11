"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";


export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login/callback`,
        },
      });

      if (error) setError(error.message);
      else setStatus(
        "Check je email! Klik op de link in je inbox om je account te activeren."
      );
      console.log("Signup data:", data);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) { router.push("/disclaimer");
      }
      if (error) setError(error.message);
      console.log("Login data:", data);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Header />
      <main className="bg-white dark:bg-black flex-1 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-black dark:text-white text-2xl font-bold text-center mb-6">
            {mode === "login" ? "Inloggen" : "Account aanmaken"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1">Naam</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Voor- en achternaam"
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <Button variant="primary">
              {mode === "login" ? "Inloggen" : "Account maken"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              className="text-sm text-blue-600 underline cursor-pointer"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login"
                ? "Nog geen account? Meld je hier aan"
                : "Heb je al een account? Log hier in"}
            </button>
          </div>

          {status && <p className="text-green-600 text-sm mt-2">{status}</p>}
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
