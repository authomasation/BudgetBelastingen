"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function AddInvoiceModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // form state
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
    const [customerName, setCustomerName] = useState("");
    const [description, setDescription] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [amountType, setAmountType] = useState("incl");
    const [vatPercent, setVatPercent] = useState("21");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentAccount, setPaymentAccount] = useState("zakelijk");
    const [status, setStatus] = useState("betaald");

    const parseNumber = (s: string) => {
        const n = parseFloat(s.replace(",", "."));
        return Number.isNaN(n) ? 0 : n;
    };

    const resetForm = () => {
        setInvoiceNumber("");
        setInvoiceDate(new Date().toISOString().split("T")[0]);
        setCustomerName("");
        setDescription("");
        setTotalAmount("");
        setAmountType("incl");
        setVatPercent("21");
        setPaymentDate("");
        setPaymentAccount("zakelijk");
        setStatus("betaald");
    };

    const handleSave = async () => {
        if (!description.trim()) {
            alert("Voer een omschrijving in");
            return;
        }
        
        if (!totalAmount.trim()) {
            alert("Voer een bedrag in");
            return;
        }

        setIsLoading(true);

        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            if (!user) {
                alert("Je moet ingelogd zijn om een factuur toe te voegen");
                return;
            }

            // berekeningen
            const total = parseNumber(totalAmount);
            const vat = parseNumber(vatPercent);
            
            let amount_excl, vat_amount, amount_incl;
            
            if (amountType === "incl") {
                // Bedrag is inclusief BTW
                amount_incl = total;
                amount_excl = Math.round((total / (1 + vat / 100)) * 100) / 100;
                vat_amount = Math.round((amount_incl - amount_excl) * 100) / 100;
            } else {
                // Bedrag is exclusief BTW
                amount_excl = total;
                vat_amount = Math.round((amount_excl * vat / 100) * 100) / 100;
                amount_incl = Math.round((amount_excl + vat_amount) * 100) / 100;
            }

            const payload = {
                user_id: user.id,
                invoice_number: invoiceNumber || null,
                invoice_date: invoiceDate,
                customer_name: customerName || null,
                description: description,
                amount: amount_excl, // For Excel export compatibility
                quantity: 1,
                unit_price: amount_excl,
                total_excl: amount_excl,
                vat_percent: vat,
                vat_amount: vat_amount,
                total_incl: amount_incl,
                payment_date: paymentDate || null,
                payment_account: paymentAccount,
                status: status,
            };

            const { error } = await supabase.from("invoices").insert(payload);

            if (error) {
                console.error("Insert error:", error);
                alert("Fout bij opslaan: " + error.message);
            } else {
                alert("Factuur opgeslagen!");
                setIsOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            alert("Er is een onverwachte fout opgetreden");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* De knop */}
            <Button variant="primary" onClick={() => setIsOpen(true)}>
                <Image src="/add.svg" alt="toevoegen" width={20} height={20} />
                Factuur toevoegen
            </Button>

            {/* De modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">Nieuwe factuur</h2>
                        <div className="space-y-6">
                            {/* Factuurgegevens */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Factuurgegevens</h3>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="invoiceNumber" className="text-sm font-medium">
                                        Factuurnummer
                                    </label>
                                    <input
                                        id="invoiceNumber"
                                        type="text"
                                        placeholder="Factuurnummer"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="invoiceDate" className="text-sm font-medium">
                                        Factuurdatum
                                    </label>
                                    <input
                                        id="invoiceDate"
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="customerName" className="text-sm font-medium">
                                        Leverancier
                                    </label>
                                    <input
                                        id="customerName"
                                        type="text"
                                        placeholder="Naam leverancier"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        Omschrijving *
                                    </label>
                                    <input
                                        id="description"
                                        type="text"
                                        placeholder="Omschrijving"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        required
                                    />
                                </div>

                            </section>

                            {/* Product/kosten */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Kosten</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor="totalAmount" className="text-sm font-medium">Totaal bedrag *</label>
                                        <input 
                                            id="totalAmount" 
                                            type="number" 
                                            step="0.01"
                                            placeholder="100.00" 
                                            value={totalAmount}
                                            onChange={(e) => setTotalAmount(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="amountType" className="text-sm font-medium">Incl/excl btw</label>
                                        <select 
                                            id="amountType" 
                                            value={amountType}
                                            onChange={(e) => setAmountType(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="incl">Bedrag incl. btw</option>
                                            <option value="excl">Bedrag excl. btw</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <label htmlFor="vatPercent" className="text-sm font-medium">Btw %</label>
                                        <select 
                                            id="vatPercent" 
                                            value={vatPercent}
                                            onChange={(e) => setVatPercent(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="21">21%</option>
                                            <option value="9">9%</option>
                                            <option value="0">0%</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Betaling */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Betaling</h3>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="paymentDate" className="text-sm font-medium">
                                        Betaaldatum
                                    </label>
                                    <input
                                        id="paymentDate"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(e) => setPaymentDate(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor="status" className="text-sm font-medium">
                                            Betaalstatus
                                        </label>
                                        <select
                                            id="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="betaald">Betaald</option>
                                            <option value="open">Open</option>
                                            <option value="deels_betaald">Deels betaald</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="paymentAccount" className="text-sm font-medium">
                                            Betaalrekening
                                        </label>
                                        <select
                                            id="paymentAccount"
                                            value={paymentAccount}
                                            onChange={(e) => setPaymentAccount(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="zakelijk">Zakelijke rekening</option>
                                            <option value="prive">Privérekening</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Knoppen */}
                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Annuleren
                                </Button>

                                <Button 
                                    variant="primary" 
                                    onClick={handleSave}
                                >
                                    {isLoading ? 'Opslaan...' : 'Opslaan'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}