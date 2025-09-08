"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === "login" ? "Inloggen" : "Account aanmaken"}
        </h1>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="jouw@email.nl"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Wachtwoord</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <input
                type="text"
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
      </div>
    </div>
  );
}
