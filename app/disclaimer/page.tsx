"use client";
export const dynamic = 'force-dynamic'

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DisclaimerPage() {
  return (
  <div className="font-sans min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex items-center justify-center p-8 sm:p-20">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md">
          <h1 className="text-black dark:text-white text-2xl font-bold text-center mb-6">
            Disclaimer
          </h1>

          {/* Kort en simpel */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">
              In het kort
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Deze website is <strong>niet van de Belastingdienst</strong>.  
              Het is alleen een hulpmiddel om jouw bonnetjes, facturen en btw-aangifte overzichtelijk bij te houden.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Jij blijft altijd <strong>zelf verantwoordelijk</strong> voor de juistheid van je gegevens en het tijdig indienen van je aangifte bij de Belastingdienst.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Met andere woorden: ik help je rekenen en plannen, maar <strong>ik kan nooit aansprakelijk worden gesteld</strong> voor fouten of boetes.
            </p>
          </section>

          {/* Juridischere taal */}
          <section>
            <h2 className="text-lg font-semibold mb-2 text-black dark:text-white">
              Juridisch
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              De informatie en functionaliteiten op deze website zijn bedoeld als hulpmiddel en bieden geen garantie op volledigheid of juistheid.  
              De website is geen officieel product van de overheid of de Belastingdienst.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              De gebruiker is en blijft te allen tijde zelf verantwoordelijk voor het correct en tijdig invullen en indienen van belastingaangiftes en andere financiële verplichtingen.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              De ontwikkelaar van deze website is niet aansprakelijk voor directe of indirecte schade, boetes of claims die voortvloeien uit het gebruik van de website of de ingevoerde gegevens.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
