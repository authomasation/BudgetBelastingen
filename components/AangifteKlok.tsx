"use client";

import { useState, useEffect } from "react";

export default function VolgendeAangifte() {
  const [dagenTeGaan, setDagenTeGaan] = useState(0);
  const [volgendePeriode, setVolgendePeriode] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();

    // genereer 4 aangifteperiodes per jaar
    const aangiftePeriodes = [
      { start: new Date(year, 0, 1), end: new Date(year, 0, 31) },   // Jan
      { start: new Date(year, 3, 1), end: new Date(year, 3, 30) },   // Apr
      { start: new Date(year, 6, 1), end: new Date(year, 6, 31) },   // Jul
      { start: new Date(year, 9, 1), end: new Date(year, 9, 31) },   // Okt
    ];

    // vind de eerstvolgende periode vanaf vandaag
    const volgende = aangiftePeriodes.find(p => today <= p.end) || aangiftePeriodes[0];

    setVolgendePeriode(volgende);

    const dagen = Math.ceil((volgende.start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setDagenTeGaan(dagen > 0 ? dagen : 0);
  }, []);

  return (
    <div className="mt-8 p-4 border rounded-lg text-center bg-gray-50 dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-2">Volgende BTW-aangifte</h2>
      <p className="text-gray-700 dark:text-gray-300">
        U kunt aangifte doen vanaf <strong>{volgendePeriode.start.toLocaleDateString()}</strong> <br />
        U moet uiterlijk indienen vóór <strong>{volgendePeriode.end.toLocaleDateString()}</strong> <br />
        <span className="text-blue-600 font-medium">
          Nog {dagenTeGaan} dagen te gaan
        </span>
      </p>
    </div>
  );
}
