"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function AddInvoiceModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* De knop */}
            <Button variant="primary"
                onClick={() => setIsOpen(true)}
            >
                <Image src="/add.svg" alt="toevoegen" width={20} height={20} />
                Factuur toevoegen
            </Button>

            {/* De modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setIsOpen(false)} // ← klik op overlay sluit modal
                >
                    <div
                        className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()} // ← voorkomt dat klik op modal zelf sluit
                    >
                        <h2 className="text-xl font-bold mb-4">Nieuwe factuur</h2>
                        <form className="space-y-6">
                            {/* Factuurgegevens */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Factuurgegevens</h3>

                                {/* Factuurnummer */}
                                <div className="space-y-1 mb-3">
                                    <label htmlFor="invoiceNumber" className="text-sm font-medium">
                                        Factuurnummer
                                    </label>
                                    <input
                                        id="invoiceNumber"
                                        type="text"
                                        placeholder="Factuurnummer"
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>

                                {/* Factuurdatum */}
                                <div className="space-y-1 mb-3">
                                    <label htmlFor="invoiceDate" className="text-sm font-medium">
                                        Factuurdatum
                                    </label>
                                    <input
                                        id="invoiceDate"
                                        type="date"
                                        defaultValue={new Date().toISOString().split("T")[0]} // yyyy-mm-dd
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>

                                {/* Leverancier + toevoegen knop */}
                                <div className="space-y-1 mb-3">
                                    <label htmlFor="supplier" className="text-sm font-medium">
                                        Leverancier
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            id="supplier"
                                            className="flex-1 border px-3 py-2 rounded"
                                        >
                                            <option>Kies leverancier...</option>
                                            <option>Coolblue</option>
                                            <option>Bol.com</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Omschrijving */}
                                <div className="space-y-1">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        Omschrijving
                                    </label>
                                    <input
                                        id="description"
                                        type="text"
                                        placeholder="Omschrijving"
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>
                            </section>


                            {/* Product/kosten */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Kosten</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor="total" className="text-sm font-medium">Totaal bedrag</label>
                                        <input id="total" type="number" className="block w-full border px-3 py-2 rounded" />
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="amountType" className="text-sm font-medium">Incl/excl btw</label>
                                        <select id="amountType" className="block w-full border px-3 py-2 rounded">
                                            <option>Bedrag incl. btw</option>
                                            <option>Bedrag excl. btw</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <label htmlFor="vat" className="text-sm font-medium">Btw %</label>
                                        <select id="vat" className="block w-full border px-3 py-2 rounded">
                                            <option>21%</option>
                                            <option>9%</option>
                                            <option>0%</option>
                                            <option>Vrijgesteld</option>
                                        </select>
                                    </div>
                                </div>


                            </section>

                            {/* Betaling */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Betaling</h3>

                                {/* Betaaldatum - full width */}
                                <div className="space-y-1 mb-3">
                                    <label htmlFor="paymentDate" className="text-sm font-medium">
                                        Betaaldatum
                                    </label>
                                    <input
                                        id="paymentDate"
                                        type="date"
                                        defaultValue={new Date().toISOString().split("T")[0]} // yyyy-mm-dd
                                        className="block w-full border px-3 py-2 rounded"
                                    />
                                </div>

                                {/* Betaalstatus + Betaalrekening naast elkaar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor="paymentStatus" className="text-sm font-medium">
                                            Betaalstatus
                                        </label>
                                        <select
                                            id="paymentStatus"
                                            className="block w-full border px-3 py-2 rounded"
                                        >
                                            <option>Betaald</option>
                                            <option>Open</option>
                                            <option>Deels betaald</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="paymentAccount" className="text-sm font-medium">
                                            Betaalrekening
                                        </label>
                                        <select
                                            id="paymentAccount"
                                            className="block w-full border px-3 py-2 rounded"
                                        >
                                            <option>Zakelijke rekening</option>
                                            <option>Privérekening</option>
                                        </select>
                                    </div>
                                </div>
                            </section>


                            {/* Extra veld */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Extra</h3>
                                <label className="block text-sm font-medium">
                                    Eigen label
                                    <input type="text" placeholder="Eigen label (bijv. inkoper, project, etc.)" className="w-full border px-3 py-2 rounded" />
                                </label>
                            </section>

                            {/* Knoppen */}
                            <div className="flex justify-end gap-2">

                                <Button variant="secondary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Annuleren
                                </Button>


                                <Button variant="primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Opslaan
                                </Button>


                            </div>
                        </form>

                    </div>
                </div>
            )}

        </>
    );
}
