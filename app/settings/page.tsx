"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import LogoutButton from "@/components/ui/LogoutButton";
import { supabase } from "@/lib/supabaseClient";

export default function AccountPage() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("nl");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
      } else if (data.user) {
        // Vul velden in met bestaande data
        setName(data.user.user_metadata.name || "");
        setLanguage(data.user.user_metadata.language || "nl");
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Laden...</p>
      </div>
    );
  }

  return (
  <div className="font-sans min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center p-8 sm:p-20">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-black dark:text-white text-2xl font-bold text-center mb-6">
            Accountinstellingen
          </h1>

          <form className="space-y-6">
            {/* Naam wijzigen */}
            <div>
              <label className="block text-sm font-medium mb-1">Wijzig je naam</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Taal instellen */}
            <div>
              <label className="block text-sm font-medium mb-1">Verander je taal</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="nl">Nederlands</option>
                <option value="en">Engels</option>
              </select>
            </div>

            {/* Wachtwoord wijzigen */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Stel een nieuw wachtwoord in
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Opslaan knop */}
            <Button variant="primary">Opslaan</Button>
          </form>

          {/* Uitloggen knop */}
          <div className="mt-8 text-center">
            <LogoutButton />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
