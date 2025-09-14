"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface FilterLabel {
    id: string;
    label_name: string;
}

interface BusinessPartner {
    id: string;
    name: string;
}

type TransactionType = 'inkoop' | 'verkoop' | null;

export default function AddInvoiceModal() {
    const [filter_labels, setFilter_labels] = useState<FilterLabel[]>([]);
    const [showAddfilter_label, setShowAddfilter_label] = useState(false);
    const [newfilter_label, setNewfilter_label] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Transaction type state
    const [transactionType, setTransactionType] = useState<TransactionType>(null);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    
    // Business partners (suppliers for inkoop, customers for verkoop)
    const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([]);
    const [showAddBusinessPartner, setShowAddBusinessPartner] = useState(false);
    const [newBusinessPartnerName, setNewBusinessPartnerName] = useState("");

    // Form state
    const [businessPartnerName, setBusinessPartnerName] = useState("");
    const [omschrijving, setOmschrijving] = useState("");
    const [factuur_nummer, setFactuur_nummer] = useState("");
    const [factuur_datum, setFactuur_datum] = useState(new Date().toISOString().split("T")[0]);
    const [btw_percentage, setBtw_percentage] = useState("");
    const [totaal_bedrag, setTotaal_bedrag] = useState("");
    const [betaal_datum, setBetaal_datum] = useState("");
    const [betaal_account, setBetaal_account] = useState("");
    const [betaal_status, setBetaal_status] = useState("");
    const [filter_label, setFilter_label] = useState("");
    const [incl_excl_btw, setIncl_excl_btw] = useState("");

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
    const addFilterLabel = async () => {
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
                setFilter_label(newfilter_label.trim());
                loadFilterLabels();
            }
        } catch (error) {
            console.error('Error adding filter label:', error);
            alert('Er is een fout opgetreden');
        }
    };

    // Load business partners when modal opens and transaction type is selected
    useEffect(() => {
        if (isOpen && transactionType) {
            loadBusinessPartners();
            loadFilterLabels();
        }
    }, [isOpen, transactionType]);

    const loadBusinessPartners = async () => {
        if (!transactionType) return;
        
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const tableName = transactionType === 'inkoop' ? 'leveranciers' : 'klanten';
            const columnName = transactionType === 'inkoop' ? 'naam_leverancier' : 'naam_klant';

            const { data, error } = await supabase
                .from(tableName)
                .select(`id, ${columnName}`)
                .eq('user_id', userData.user.id)
                .order(columnName);

            if (error) {
                console.error(`Error loading ${tableName}:`, error);
            } else {
                const partners = data?.map(item => ({
                    id: item.id,
                    name: (item as Record<string, any>)[columnName]
                })) || [];
                setBusinessPartners(partners);
            }
        } catch (error) {
            console.error('Error loading business partners:', error);
        }
    };

    const addBusinessPartner = async () => {
        if (!newBusinessPartnerName.trim() || !transactionType) {
            alert(`Voer een ${transactionType === 'inkoop' ? 'leveranciers' : 'klant'}naam in`);
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) return;

            const tableName = transactionType === 'inkoop' ? 'leveranciers' : 'klanten';
            const columnName = transactionType === 'inkoop' ? 'naam_leverancier' : 'naam_klant';

            const { error } = await supabase
                .from(tableName)
                .insert({
                    user_id: userData.user.id,
                    [columnName]: newBusinessPartnerName.trim()
                });

            if (error) {
                console.error(`Error adding ${tableName}:`, error);
                alert(`Fout bij toevoegen ${transactionType === 'inkoop' ? 'leverancier' : 'klant'}: ` + error.message);
            } else {
                setNewBusinessPartnerName("");
                setShowAddBusinessPartner(false);
                setBusinessPartnerName(newBusinessPartnerName.trim());
                loadBusinessPartners();
            }
        } catch (error) {
            console.error('Error adding business partner:', error);
            alert('Er is een fout opgetreden');
        }
    };

    const parseNumber = (s: string) => {
        const n = parseFloat(s.replace(",", "."));
        return Number.isNaN(n) ? 0 : n;
    };

    const resetForm = () => {
        setFactuur_nummer("");
        setFactuur_datum(new Date().toISOString().split("T")[0]);
        setBusinessPartnerName("");
        setOmschrijving("");
        setTotaal_bedrag("");
        setIncl_excl_btw("");
        setBtw_percentage("");
        setBetaal_datum("");
        setBetaal_account("");
        setBetaal_status("");
        setShowAddBusinessPartner(false);
        setNewBusinessPartnerName("");
        setFilter_label("");
        setTransactionType(null);
        setShowTypeSelector(false);
    };

    const handleSave = async () => {
        if (!transactionType) {
            alert("Selecteer eerst het type transactie");
            return;
        }

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

        if (!incl_excl_btw) {
            alert("Vul inclusief of exclusief btw in");
            return;
        }

        if (!btw_percentage) {
            alert("Vul een btw percentage in");
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

            // Create payload with appropriate field names for each transaction type
            const payload = {
                user_id: user.id,
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
                updated_at: new Date().toISOString(),
                incl_excl_btw: incl_excl_btw,
                // Use appropriate field name based on transaction type
                ...(transactionType === 'inkoop' 
                    ? { naam_leverancier: businessPartnerName || null }
                    : { naam_klant: businessPartnerName || null }
                )
            };

            // Use the appropriate table based on transaction type
            const tableName = transactionType === 'inkoop' ? 'inkoop_facturen' : 'verkoop_facturen';
            const factuurType = transactionType === 'inkoop' ? 'Inkoopfactuur' : 'Verkoopfactuur';
            
            const { error } = await supabase.from(tableName).insert(payload);

            if (error) {
                console.error("Insert error:", error);
                alert("Fout bij opslaan: " + error.message);
            } else {
                alert("Uw " + factuurType + " is opgeslagen!");
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

    const handleOpenModal = () => {
        setIsOpen(true);
        setShowTypeSelector(true);
    };

    const handleTypeSelection = (type: TransactionType) => {
        setTransactionType(type);
        setShowTypeSelector(false);
    };

    const getBusinessPartnerLabel = () => {
        return transactionType === 'inkoop' ? 'Leverancier' : 'Klant';
    };

    const getFormTitle = () => {
        if (transactionType === 'inkoop') return 'Nieuwe inkoopfactuur';
        if (transactionType === 'verkoop') return 'Nieuwe verkoopfactuur';
        return 'Nieuwe factuur';
    };

    const getDescriptionPlaceholder = () => {
        return transactionType === 'inkoop' ? 'Wat heb je gekocht?' : 'Wat heb je verkocht?';
    };

    return (
        <>
            <Button variant="primary" onClick={handleOpenModal}>
                <Image src="/add.svg" alt="toevoegen" width={20} height={20} />
                Factuur toevoegen
            </Button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        if (showTypeSelector) {
                            setIsOpen(false);
                            resetForm();
                        }
                    }}
                >
                    {showTypeSelector ? (
                        // Transaction Type Selector
                        <div
                            className="bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded shadow-lg w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4 text-center">Kies transactie type</h2>
                            <div className="space-y-4">
                                <button
                                    onClick={() => handleTypeSelection('inkoop')}
                                    className="w-full p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg">
                                        🛒
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-blue-700 dark:text-blue-300">Inkoop</div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Facturen van leveranciers</div>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => handleTypeSelection('verkoop')}
                                    className="w-full p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-lg">
                                        💰
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-green-700 dark:text-green-300">Verkoop</div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Facturen naar klanten</div>
                                    </div>
                                </button>
                            </div>
                            
                            <div className="mt-6 text-center">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setIsOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Annuleren
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Invoice Form
                        <div
                            className="bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">{getFormTitle()}</h2>
                                <button
                                    onClick={() => {
                                        setShowTypeSelector(true);
                                        setTransactionType(null);
                                    }}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Type wijzigen
                                </button>
                            </div>
                            
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
                                            placeholder="Factuurnummer"
                                            value={factuur_nummer}
                                            onChange={(e) => setFactuur_nummer(e.target.value)}
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
                                            onChange={(e) => setFactuur_datum(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        />
                                    </div>

                                    {/* Business Partner with dropdown and add button */}
                                    <div className="space-y-1 mb-3">
                                        <label htmlFor="business_partner" className="text-sm font-medium">
                                            {getBusinessPartnerLabel()}
                                        </label>
                                        {!showAddBusinessPartner ? (
                                            <div className="flex gap-2">
                                                <select
                                                    id="business_partner"
                                                    value={businessPartnerName}
                                                    onChange={(e) => setBusinessPartnerName(e.target.value)}
                                                    className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                                >
                                                    <option value="">Kies {getBusinessPartnerLabel().toLowerCase()}...</option>
                                                    {businessPartners.map(partner => (
                                                        <option key={partner.id} value={partner.name}>
                                                            {partner.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddBusinessPartner(true)}
                                                    className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-100 hover:text-[#333] cursor-pointer"
                                                    title={`Voeg nieuwe ${getBusinessPartnerLabel().toLowerCase()} toe`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={`Nieuwe ${getBusinessPartnerLabel().toLowerCase()}`}
                                                    value={newBusinessPartnerName}
                                                    onChange={(e) => setNewBusinessPartnerName(e.target.value)}
                                                    className="flex-1 border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addBusinessPartner();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addBusinessPartner}
                                                    className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowAddBusinessPartner(false);
                                                        setNewBusinessPartnerName("");
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
                                            placeholder={getDescriptionPlaceholder()}
                                            value={omschrijving}
                                            onChange={(e) => setOmschrijving(e.target.value)}
                                            className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                        />
                                    </div>

                                    {/* Filter Label */}
                                    <div className="space-y-1 mb-3">
                                        <label htmlFor="filter_label" className="text-sm font-medium">
                                            Filter Label
                                        </label>
                                        {!showAddfilter_label ? (
                                            <div className="flex gap-2">
                                                <select
                                                    id="filter_label"
                                                    value={filter_label}
                                                    onChange={(e) => setFilter_label(e.target.value)}
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
                                                            addFilterLabel();
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addFilterLabel}
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
                                                step="0.01"
                                                placeholder="€ 100.00"
                                                value={totaal_bedrag}
                                                onChange={(e) => setTotaal_bedrag(e.target.value)}
                                                className="w-full border px-3 py-2 rounded dark:bg-gray-800 dark:border-gray-600"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label htmlFor="incl_excl_btw" className="text-sm font-medium">Incl/excl btw *</label>
                                            <select
                                                id="incl_excl_btw"
                                                value={incl_excl_btw}
                                                onChange={(e) => setIncl_excl_btw(e.target.value)}
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
                                                onChange={(e) => setBtw_percentage(e.target.value)}
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
                                            onChange={(e) => setBetaal_datum(e.target.value)}
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
                                                onChange={(e) => setBetaal_status(e.target.value)}
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
                                                onChange={(e) => setBetaal_account(e.target.value)}
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
                                        onClick={() => {
                                            setIsOpen(false);
                                            resetForm();
                                        }}
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
                    )}
                </div>
            )}
        </>
    );
}