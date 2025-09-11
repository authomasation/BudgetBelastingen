"use client";

import Button from "@/components/ui/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Header boven */}
      <Header />

      {/* Content in het midden */}
      <main className="bg-white dark:bg-black flex-1 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-black dark:text-white text-2xl font-bold text-center mb-6">
            Neem contact op
          </h1>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="jouw@email.nl"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Naam (optioneel) */}
            <div>
              <label className="block text-sm font-medium mb-1">Naam (optioneel)</label>
              <input
                type="text"
                placeholder="Voor- en achternaam"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Type contact */}
            <div>
              <label className="block text-sm font-medium mb-1">Type contact</label>
              <select
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option>Vraag</option>
                <option>Opmerking</option>
                <option>Feedback</option>
              </select>
            </div>

            {/* Bericht */}
            <div>
              <label className="block text-sm font-medium mb-1">Bericht *</label>
              <textarea
                required
                rows={5}
                placeholder="Typ hier je bericht..."
                className="w-full border px-3 py-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Verstuurknop */}
            <Button variant="primary" className="w-full">
              Verstuur
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
