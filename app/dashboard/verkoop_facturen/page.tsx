"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { ArrowLeft, Save, Edit2, X, Check } from "lucide-react";

interface Invoice {
    id: string;
    naam_klant: string;
    omschrijving: string;
    factuur_nummer: string;
    factuur_datum: string;
    btw_percentage: string;
    totaal_bedrag: string;
    betaal_datum: string;
    betaal_account: string;
    betaal_status: string;
    filter_label: string;
    incl_excl_btw: string;
    created_at: string;
    updated_at?: string;
}

export default function FacturenBeherenPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<Invoice | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load invoices
    const loadInvoices = async () => {
        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const { data, error } = await supabase
                .from('verkoop_facturen')
                .select('*')
                .eq('user_id', userData.user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading invoices:', error);
                setError('Fout bij laden van facturen');
            } else {
                setInvoices(data || []);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            setError('Er is een fout opgetreden');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, []);

    // Start editing
    const startEditing = (invoice: Invoice) => {
        setEditingId(invoice.id);
        setEditingData({ ...invoice });
    };


    //Delete invoice
    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze factuur wilt verwijderen?")) return;
        const { error } = await supabase.from("verkoop_facturen").delete().eq("id", id);
        if (error) {
            console.error("Delete error:", error);
            setError("Verwijderen mislukt");
        } else {
            setInvoices((prev) => prev.filter((inv) => inv.id !== id));
        }
    };


    // Cancel editing
    const cancelEditing = () => {
        setEditingId(null);
        setEditingData(null);
    };

    // Save changes
    const saveChanges = async () => {
        if (!editingData) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('verkoop_facturen')
                .update({
                    naam_klant: editingData.naam_klant,
                    omschrijving: editingData.omschrijving,
                    factuur_nummer: editingData.factuur_nummer,
                    factuur_datum: editingData.factuur_datum,
                    btw_percentage: editingData.btw_percentage,
                    totaal_bedrag: editingData.totaal_bedrag,
                    betaal_datum: editingData.betaal_datum,
                    betaal_account: editingData.betaal_account,
                    betaal_status: editingData.betaal_status,
                    filter_label: editingData.filter_label,
                    incl_excl_btw: editingData.incl_excl_btw,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingData.id);

            if (error) {
                throw error;
            }

            // Update local state
            setInvoices(invoices.map(invoice =>
                invoice.id === editingData.id ? { ...editingData, updated_at: new Date().toISOString() } : invoice
            ));

            setEditingId(null);
            setEditingData(null);
        } catch (error) {
            console.error('Error saving invoice:', error);
            setError('Fout bij opslaan van factuur');
        } finally {
            setSaving(false);
        }
    };

    // Handle input change
    const handleInputChange = (field: keyof Invoice, value: string) => {
        if (editingData) {
            setEditingData({ ...editingData, [field]: value });
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-xl">Facturen laden...</div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                >
                                    <ArrowLeft size={20} />
                                    Terug naar dashboard
                                </Link>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Verkoop facturen
                            </h1>
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard/inkoop_facturen"
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                >
                                    Ga naar inkoop facturen
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6 py-6">
                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                            <button
                                onClick={() => setError(null)}
                                className="ml-4 text-red-500 hover:text-red-700"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg mb-4">Geen facturen gevonden</div>
                            <Link
                                href="/dashboard"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Voeg eerst een factuur toe op het dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Factuur nr.</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Factuur Datum</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">klant</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Omschrijving</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Filter</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">TotaalBedrag</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">incl/excl BTW</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">btw percentage</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Betaal datum</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Betaal status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Betaal rekening</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acties</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id} className={editingId === invoice.id ? "bg-blue-50 dark:bg-blue-900" : ""}>
                                                {/* Factuur nr */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingData?.factuur_nummer || ""}
                                                            onChange={(e) => handleInputChange("factuur_nummer", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">{invoice.factuur_nummer}</span>
                                                    )}
                                                </td>

                                                {/* Factuur Datum */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="date"
                                                            value={editingData?.factuur_datum || ""}
                                                            onChange={(e) => handleInputChange("factuur_datum", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">
                                                            {new Date(invoice.factuur_datum).toLocaleDateString("nl-NL")}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* klant */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingData?.naam_klant || ""}
                                                            onChange={(e) => handleInputChange("naam_klant", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">{invoice.naam_klant}</span>
                                                    )}
                                                </td>

                                                {/* Omschrijving */}
                                                <td className="px-6 py-4 text-sm">
                                                    {editingId === invoice.id ? (
                                                        <textarea
                                                            value={editingData?.omschrijving || ""}
                                                            onChange={(e) => handleInputChange("omschrijving", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                            rows={2}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">{invoice.omschrijving}</span>
                                                    )}
                                                </td>

                                                {/* Filter */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingData?.filter_label || ""}
                                                            onChange={(e) => handleInputChange("filter_label", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">{invoice.filter_label}</span>
                                                    )}
                                                </td>

                                                {/* TotaalBedrag */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingData?.totaal_bedrag || ""}
                                                            onChange={(e) => handleInputChange("totaal_bedrag", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">€{invoice.totaal_bedrag}</span>
                                                    )}
                                                </td>

                                                {/* incl/excl BTW */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <select
                                                            value={editingData?.incl_excl_btw || ""}
                                                            onChange={(e) => handleInputChange("incl_excl_btw", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        >
                                                            <option value="incl">Incl.</option>
                                                            <option value="excl">Excl.</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">{invoice.incl_excl_btw}</span>
                                                    )}
                                                </td>

                                                {/* BTW percentage */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <select
                                                            value={editingData?.btw_percentage || ""}
                                                            onChange={(e) => handleInputChange("btw_percentage", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        >
                                                            <option value="0.21">21%</option>
                                                            <option value="0.09">9%</option>
                                                            <option value="0.00">0%</option>
                                                        </select>
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">
                                                            {(parseFloat(invoice.btw_percentage) * 100).toFixed(0)}%
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Betaal datum */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="date"
                                                            value={editingData?.betaal_datum || ""}
                                                            onChange={(e) => handleInputChange("betaal_datum", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">
                                                            {invoice.betaal_datum ? new Date(invoice.betaal_datum).toLocaleDateString("nl-NL") : ""}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Betaal status */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <select
                                                            value={editingData?.betaal_status || ""}
                                                            onChange={(e) => handleInputChange("betaal_status", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        >
                                                            <option value="Betaald">Betaald</option>
                                                            <option value="Open">Open</option>
                                                            <option value="Deels betaald">Deels betaald</option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${invoice.betaal_status === "Betaald"
                                                                ? "bg-green-400 text-green-800"
                                                                : invoice.betaal_status === "Open"
                                                                    ? "bg-red-400 text-red-800"
                                                                    : "bg-yellow-200 text-yellow-800"
                                                                }`}
                                                        >
                                                            {invoice.betaal_status}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Betaal rekening */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingData?.betaal_account || ""}
                                                            onChange={(e) => handleInputChange("betaal_account", e.target.value)}
                                                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <span className="text-gray-900 dark:text-gray-100">{invoice.betaal_account}</span>
                                                    )}
                                                </td>

                                                {/* Acties */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingId === invoice.id ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={saveChanges}
                                                                disabled={saving}
                                                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                className="text-gray-600 hover:text-gray-900"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => startEditing(invoice)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(invoice.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>

                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </ProtectedRoute>
    );
}