"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface FilterLabel {
    id: string;
    label_name: string;
}

interface leveranciers {
    id: string;
    naam_leverancier: string;
}

export default function AddInvoiceModal() {
    const [filter_labels, setFilter_labels] = useState<FilterLabel[]>([]);
    const [showAddfilter_label, setShowAddfilter_label] = useState(false);
    const [newfilter_label, setNewfilter_label] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [leveranciers, setleveranciers] = useState<leveranciers[]>([]);
    const [showAddleveranciers, setShowAddleveranciers] = useState(false);
    const [newnaam_leverancier, setNewnaam_leverancier] = useState("");

    // Form state
    const [naam_leverancier, setnaam_leverancier] = useState("");
    const [omschrijving, setomschrijving] = useState("");
    const [factuur_nummer, setfactuur_nummer] = useState("");
    const [factuur_datum, setfactuur_datum] = useState(new Date().toISOString().split("T")[0]);
    const [btw_percentage, setbtw_percentage] = useState("");
    const [totaal_bedrag, settotaal_bedrag] = useState("");
    const [betaal_datum, setbetaal_datum] = useState("");
    const [betaal_account, setbetaal_account] = useState("");
    const [betaal_status, setbetaal_status] = useState("");
    const [filter_label, setfilter_label] = useState("");
    const [incl_excl_btw, setincl_excl_btw] = useState("");


    // Load filter labels function
    const loadFilterLabels = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const { data, error } = await supabase
                .from('filter_labels')
                .select('id, label_name')
                .eq('user_id', userData.user.id)
                .order('label_name');

            if (error) {
                console.error('Error loading filter labels:', error);
            } else {
                setFilter_labels(data || []);
            }
        } catch (error) {
            console.error('Error loading filter labels:', error);
        }
    };

    // Add filter label function
    const addfilter_label = async () => {
        if (!newfilter_label.trim()) {
            alert("Voer een label naam in");
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const { error } = await supabase
                .from('filter_labels')
                .insert({
                    user_id: userData.user.id,
                    label_name: newfilter_label.trim()
                });

            if (error) {
                console.error('Error adding filter label:', error);
                alert('Fout bij toevoegen label: ' + error.message);
            } else {
                setNewfilter_label("");
                setShowAddfilter_label(false);
                setfilter_label(newfilter_label.trim());
                loadFilterLabels(); // Refresh the list
            }
        } catch (error) {
            console.error('Error adding filter label:', error);
            alert('Er is een fout opgetreden');
        }
    };

    // Load leveranciers when modal opens
    useEffect(() => {
        if (isOpen) {
            loadleveranciers();
            loadFilterLabels();
        }
    }, [isOpen]);

    const loadleveranciers = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const { data, error } = await supabase
                .from('leveranciers')
                .select('id, naam_leverancier')
                .eq('user_id', userData.user.id)
                .order('naam_leverancier');

            if (error) {
                console.error('Error loading leveranciers:', error);
            } else {
                setleveranciers(data || []);
            }
        } catch (error) {
            console.error('Error loading leveranciers:', error);
        }
    };

    const addleveranciers = async () => {
        if (!newnaam_leverancier.trim()) {
            alert("Voer een leveranciersnaam in");
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const { error } = await supabase
                .from('leveranciers')
                .insert({
                    user_id: userData.user.id,
                    naam_leverancier: newnaam_leverancier.trim()
                });

            if (error) {
                console.error('Error adding leveranciers:', error);
                alert('Fout bij toevoegen leverancier: ' + error.message);
            } else {
                setNewnaam_leverancier("");
                setShowAddleveranciers(false);
                setnaam_leverancier(newnaam_leverancier.trim());
                loadleveranciers(); // Refresh the list
            }
        } catch (error) {
            console.error('Error adding leveranciers:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const parseNumber = (s: string) => {
        const n = parseFloat(s.replace(",", "."));
        return Number.isNaN(n) ? 0 : n;
    };

    const resetForm = () => {
        setfactuur_nummer("");
        setfactuur_datum(new Date().toISOString().split("T")[0]);
        setnaam_leverancier("");
        setomschrijving("");
        settotaal_bedrag("");
        setincl_excl_btw("");
        setbtw_percentage("");
        setbetaal_datum("");
        setbetaal_account("");
        setbetaal_status("");
        setShowAddleveranciers(false);
        setNewnaam_leverancier("");
    };

    const handleSave = async () => {
        if (!factuur_nummer.trim()) {
            alert("Voer een factuur nummer in");
            return;
        }

        if (!factuur_datum.trim()) {
            alert("Voer een factuur datum in");
            return;
        }

        if (!totaal_bedrag.trim()) {
            alert("Voer het totaal bedrag in");
            return;
        }

        if (!incl_excl_btw || incl_excl_btw === "") {
            alert("Vul inclusief of exclusief btw in");
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

            const payload = {
                user_id: user.id,
                naam_leverancier: naam_leverancier || null,
                omschrijving: omschrijving || null,
                created_at: new Date().toISOString(),
                factuur_nummer: factuur_nummer,
                factuur_datum: factuur_datum,
                btw_percentage: btw_percentage,
                totaal_bedrag: parseNumber(totaal_bedrag),
                betaal_datum: betaal_datum || null,
                betaal_account: betaal_account || null,
                betaal_status: betaal_status || null,
                filter_label: filter_label || null,
                updated_at: new Date().toISOString() || null,
                incl_excl_btw: incl_excl_btw
            };

            const { error } = await supabase.from("inkoop_facturen").insert(payload);

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
            <Button variant="primary" onClick={() => setIsOpen(true)}>
                <Image src="/add.svg" alt="toevoegen" width={20} height={20} />
                Factuur toevoegen
            </Button>

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
                            {/* Invoice Details */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Factuurgegevens</h3>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="factuur_nummer" className="text-sm font-medium">
                                        Factuurnummer *
                                    </label>
                                    <input
                                        id="factuur_nummer"
                                        type="text"
                                        placeholder="Factuurnummer (optioneel)"
                                        value={factuur_nummer}
                                        onChange={(e) => setfactuur_nummer(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="factuur_datum" className="text-sm font-medium">
                                        Factuurdatum *
                                    </label>
                                    <input
                                        id="factuur_datum"
                                        type="date"
                                        value={factuur_datum}
                                        onChange={(e) => setfactuur_datum(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                {/* leveranciers with dropdown and add button */}
                                <div className="space-y-1 mb-3">
                                    <label htmlFor="naam_leverancier" className="text-sm font-medium">
                                        Leverancier
                                    </label>
                                    {!showAddleveranciers ? (
                                        <div className="flex gap-2">
                                            <select
                                                id="naam_leverancier"
                                                value={naam_leverancier}
                                                onChange={(e) => setnaam_leverancier(e.target.value)}
                                                className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                            >
                                                <option value="">Kies leverancier...</option>
                                                {leveranciers.map(leverancier => (
                                                    <option key={leverancier.id} value={leverancier.naam_leverancier}>
                                                        {leverancier.naam_leverancier}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddleveranciers(true)}
                                                className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 hover:text-[#333] cursor-pointer"
                                                title="Voeg nieuwe leverancier toe"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nieuwe leverancier"
                                                value={newnaam_leverancier}
                                                onChange={(e) => setNewnaam_leverancier(e.target.value)}
                                                className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addleveranciers();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={addleveranciers}
                                                className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddleveranciers(false);
                                                    setNewnaam_leverancier("");
                                                }}
                                                className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 hover:text-[#333]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="omschrijving" className="text-sm font-medium">
                                        Omschrijving
                                    </label>
                                    <input
                                        id="omschrijving"
                                        type="text"
                                        placeholder="Wat heb je gekocht?"
                                        value={omschrijving}
                                        onChange={(e) => setomschrijving(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                {/* filter_label with dropdown and add button */}

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="filter_label" className="text-sm font-medium">
                                        Filter Label
                                    </label>
                                    {!showAddfilter_label ? (
                                        <div className="flex gap-2">
                                            <select
                                                id="filter_label"
                                                value={filter_label}
                                                onChange={(e) => setfilter_label(e.target.value)}
                                                className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                            >
                                                <option value="">Kies label...</option>
                                                {filter_labels.map(label => (
                                                    <option key={label.id} value={label.label_name}>
                                                        {label.label_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddfilter_label(true)}
                                                className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 hover:text-[#333] cursor-pointer"
                                                title="Voeg nieuwe label toe"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nieuwe label"
                                                value={newfilter_label}
                                                onChange={(e) => setNewfilter_label(e.target.value)}
                                                className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        addfilter_label();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={addfilter_label}
                                                className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowAddfilter_label(false);
                                                    setNewfilter_label("");
                                                }}
                                                className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 hover:text-[#333]"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </section>

                            {/* Costs */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Kosten</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor="totaal_bedrag" className="text-sm font-medium">Totaal bedrag *</label>
                                        <input
                                            id="totaal_bedrag"
                                            type="number"
                                            step="1.00"
                                            placeholder="€ 100.-"
                                            value={totaal_bedrag}
                                            onChange={(e) => settotaal_bedrag(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="incl_excl_btw" className="text-sm font-medium">Incl/excl btw *</label>
                                        <select
                                            id="incl_excl_btw"
                                            value={incl_excl_btw}
                                            onChange={(e) => setincl_excl_btw(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="">Selecteer...</option>
                                            <option value="incl">Inclusief</option>
                                            <option value="excl">Exclusief</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2">
                                        <label htmlFor="btw_percentage" className="text-sm font-medium">Btw percentage *</label>
                                        <select
                                            id="btw_percentage"
                                            value={btw_percentage}
                                            onChange={(e) => setbtw_percentage(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="">Selecteer...</option>
                                            <option value="0.21">21%</option>
                                            <option value="0.09">9%</option>
                                            <option value="0.00">0%</option>
                                            <option value="0">Vrijgesteld</option>
                                            
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Payment */}
                            <section>
                                <h3 className="text-lg font-semibold mb-2">Betaling</h3>

                                <div className="space-y-1 mb-3">
                                    <label htmlFor="betaal_datum" className="text-sm font-medium">
                                        Betaal datum
                                    </label>
                                    <input
                                        id="betaal_datum"
                                        type="date"
                                        value={betaal_datum}
                                        onChange={(e) => setbetaal_datum(e.target.value)}
                                        className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor="betaal_status" className="text-sm font-medium">
                                            Betaal status
                                        </label>
                                        <select
                                            id="betaal_status"
                                            value={betaal_status}
                                            onChange={(e) => setbetaal_status(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="">Selecteer...</option>
                                            <option value="betaald">Betaald</option>
                                            <option value="deels_betaald">Deels betaald</option>
                                            <option value="open">Open</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label htmlFor="betaal_account" className="text-sm font-medium">
                                            Betaal rekening
                                        </label>
                                        <select
                                            id="betaal_account"
                                            value={betaal_account}
                                            onChange={(e) => setbetaal_account(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        >
                                            <option value="">Selecteer...</option>
                                            <option value="zakelijk">Zakelijk</option>
                                            <option value="prive">Privé</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Buttons */}
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