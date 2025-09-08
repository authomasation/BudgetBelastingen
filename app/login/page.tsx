"use client";
import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">
        {mode === "login" ? "Inloggen" : "Account aanmaken"}
      </h1>

      <form className="flex flex-col gap-2 w-64">
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Wachtwoord" className="border p-2 rounded" />
        {mode === "signup" && (
          <input type="text" placeholder="Naam" className="border p-2 rounded" />
        )}
        <button className="bg-blue-600 text-white py-2 rounded">
          {mode === "login" ? "Inloggen" : "Account maken"}
        </button>
      </form>

      <button
        className="text-sm text-blue-600 underline"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login"
          ? "Nog geen account? Meld je hier aan"
          : "Heb je al een account? Log hier in"}
      </button>
    </div>
  );
}
