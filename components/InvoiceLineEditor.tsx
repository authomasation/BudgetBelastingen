import React from "react";

type Props = {
  line: InvoiceLine;
  onChange: (updated: InvoiceLine) => void;
  inclExcl: "incl" | "excl" | "";

};

export type InvoiceLine = {
  id: string;
  totaal_bedrag: number | "";
  btw_percentage: number | "";
  btw_calculated: number;
  btw_manual?: number | "";
};

export default function InvoiceLineEditor({ line, onChange, inclExcl }: Props) {
  const handleChange = (field: keyof InvoiceLine, value: string) => {
    const updated = { ...line, [field]: value };

    if (field === "totaal_bedrag" || field === "btw_percentage") {
      const bedrag = parseFloat(updated.totaal_bedrag as any) || 0;
      const percentage = parseFloat(updated.btw_percentage as any) || 0;

      let calculated = 0;
      if (inclExcl === "incl") {
        calculated = bedrag - bedrag / (1 + percentage);
      } else if (inclExcl === "excl") {
        calculated = bedrag * percentage;
      }
      updated.btw_calculated = Math.round(calculated * 100) / 100;
    }

    onChange(updated);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <label className="text-sm font-medium">Totaal bedrag *</label>
        <div className="flex rounded border overflow-hidden">
          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-r dark:border-gray-600">
            €
          </span>
          <input
            placeholder="0,00"
            value={line.totaal_bedrag}
            onChange={(e) => handleChange("totaal_bedrag", e.target.value)}
            className="flex-1 px-3 py-2 dark:bg-gray-800"
            required
          />
        </div>
      </div>



      <div className="space-y-1">
        <label className="text-sm font-medium">Btw percentage *</label>
        <select
          value={line.btw_percentage}
          onChange={(e) => handleChange("btw_percentage", e.target.value)}
          className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          required
        >
          <option value="">Selecteer...</option>
          <option value="0.21">21%</option>
          <option value="0.09">9%</option>
          <option value="0.00">0%</option>
          <option value="0">Vrijgesteld</option>
        </select>
      </div>

      <div className="space-y-1">
        
        <label className="text-sm font-medium">Berekende BTW</label>
        <div className="flex rounded border overflow-hidden">
 <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-r dark:border-gray-600">
            €
          </span>
        <input
          value={line.btw_calculated}
          readOnly
            className="flex-1 px-3 py-2 dark:bg-gray-800"
        />
      </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Handmatige BTW overschrijven</label>
        <div className="flex rounded border overflow-hidden">
 <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-r dark:border-gray-600">
            €
          </span>
        <input
          value={line.btw_manual ?? ""}
          onChange={(e) => handleChange("btw_manual", e.target.value)}
            className="flex-1 px-3 py-2 dark:bg-gray-800"
        />
      </div>
        </div>
    </div>
  );
}
