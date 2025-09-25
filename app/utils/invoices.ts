import { useMemo } from "react";
import { InvoiceLine } from "@/components/InvoiceLineEditor";

export function useInvoiceTotals(lines: InvoiceLine[], inclExcl: "incl" | "excl" | "") {
  return useMemo(() => {
    let totalAmount = 0;
    let totalBtw = 0;

    for (const line of lines) {
      const bedrag = parseFloat(line.totaal_bedrag as any) || 0;

      // btw: handmatige override > berekend
      const btw =
        line.btw_manual !== "" && line.btw_manual !== undefined
          ? parseFloat(line.btw_manual as any) || 0
          : line.btw_calculated || 0;

      totalAmount += bedrag;
      totalBtw += btw;
    }

    return {
      totalAmount,
      totalBtw,
    };
  }, [lines, inclExcl]);
}
