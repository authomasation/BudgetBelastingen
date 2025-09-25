"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Invoice {
  id: string;
  nummer: string;
  datum: string;
  leverancier: string;
  totaal: string;
  btw: string;
  status: string;
  btwPercentage: string;
  regels: { id: string; omschrijving: string; bedrag: string; btw: string }[];
}

const dummyInvoices: Invoice[] = [
  {
    id: "1",
    nummer: "2025-001",
    datum: "2025-09-12",
    leverancier: "Coolblue B.V.",
    totaal: "€ 1.210,00",
    btw: "€ 210,00",
    btwPercentage: "21%",
    status: "Betaald",
    regels: [
      { id: "r1", omschrijving: "Laptop", bedrag: "€ 1.000,00", btw: "€ 210,00" },
      { id: "r2", omschrijving: "Muis", bedrag: "€ 100,00", btw: "€ 21,00" },
    ],
  },
  {
    id: "2",
    nummer: "2025-002",
    datum: "2025-10-01",
    leverancier: "Bol.com",
    totaal: "€ 242,00",
    btw: "€ 42,00",
    btwPercentage: "21%",
    status: "Open",
    regels: [
      { id: "r3", omschrijving: "Monitor", bedrag: "€ 200,00", btw: "€ 42,00" },
    ],
  },
  {
    id: "3",
    nummer: "2025-003",
    datum: "2025-11-15",
    leverancier: "MediaMarkt",
    totaal: "€ 109,00",
    btw: "€ 9,00",
    btwPercentage: "9%",
    status: "Open",
    regels: [
      { id: "r4", omschrijving: "Koptelefoon", bedrag: "€ 100,00", btw: "€ 9,00" },
    ],
  },
  {
    id: "4",
    nummer: "2025-004",
    datum: "2025-08-20",
    leverancier: "Apple NL",
    totaal: "€ 2.420,00",
    btw: "€ 420,00",
    btwPercentage: "21%",
    status: "Betaald",
    regels: [
      { id: "r5", omschrijving: "iPhone", bedrag: "€ 2.000,00", btw: "€ 420,00" },
    ],
  },
];

export default function InvoiceDemoPage() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showOptional, setShowOptional] = useState(false);

  // Filters
  const [filterLeverancier, setFilterLeverancier] = useState("");
  const [filterBtw, setFilterBtw] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const toggleDetail = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredInvoices = dummyInvoices.filter((inv) => {
    const leverancierMatch =
      !filterLeverancier ||
      inv.leverancier.toLowerCase().includes(filterLeverancier.toLowerCase());
    const btwMatch = !filterBtw || inv.btwPercentage === filterBtw;
    const fromMatch = !filterFrom || new Date(inv.datum) >= new Date(filterFrom);
    const toMatch = !filterTo || new Date(inv.datum) <= new Date(filterTo);
    return leverancierMatch && btwMatch && fromMatch && toMatch;
  });

  return (
    <div className="p-6 space-y-6 mx-auto max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inkoopfacturen</h1>
        <button
          onClick={() => setShowOptional((prev) => !prev)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {showOptional ? "Verberg optionele kolommen" : "Toon optionele kolommen"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Zoek leverancier..."
          value={filterLeverancier}
          onChange={(e) => setFilterLeverancier(e.target.value)}
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
        />
        <select
          value={filterBtw}
          onChange={(e) => setFilterBtw(e.target.value)}
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Alle BTW%</option>
          <option value="21%">21%</option>
          <option value="9%">9%</option>
          <option value="0%">0%</option>
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={(e) => setFilterFrom(e.target.value)}
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="date"
          value={filterTo}
          onChange={(e) => setFilterTo(e.target.value)}
          className="border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Tabel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Factuurnummer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Factuurdatum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Leverancier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                BTW%
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Totaal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                BTW
              </th>
              {showOptional && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
           
                </th>
              )}
              {showOptional && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Extra info
                </th>
              )}
              {showOptional && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Extra info
                </th>
              )}
              {showOptional && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Extra info
                </th>
              )}
              {showOptional && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Extra info
                </th>
              )}
              
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInvoices.map((inv) => (
              <>
                <tr
                  key={inv.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={() => toggleDetail(inv.id)}
                >
                  <td className="px-6 py-4">{inv.nummer}</td>
                  <td className="px-6 py-4">{inv.datum}</td>
                  <td className="px-6 py-4">{inv.leverancier}</td>
                  <td className="px-6 py-4">{inv.btwPercentage}</td>
                  <td className="px-6 py-4">{inv.totaal}</td>
                  <td className="px-6 py-4">{inv.btw}</td>
                  
                  <td className="px-6 py-4 text-right">
                    {expanded.includes(inv.id) ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </td>
                </tr>
                {expanded.includes(inv.id) && (
                  <tr>
                    <td colSpan={showOptional ? 8 : 7} className="bg-gray-50 dark:bg-gray-900">
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">Factuurregels</h3>
                        <table className="w-full text-sm border">
                          <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                              <th className="px-3 py-2 text-left">Omschrijving</th>
                              <th className="px-3 py-2 text-left">Bedrag</th>
                              <th className="px-3 py-2 text-left">BTW</th>
                            </tr>
                          </thead>
                          <tbody>
                            {inv.regels.map((regel) => (
                              <tr key={regel.id} className="border-t">
                                <td className="px-3 py-2">{regel.omschrijving}</td>
                                <td className="px-3 py-2">{regel.bedrag}</td>
                                <td className="px-3 py-2">{regel.btw}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
