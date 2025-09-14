"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";
import Footer from "@/components/Footer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface InvoiceData {
    id: string;
    factuur_nummer: string;
    factuur_datum: string;
    totaal_bedrag: number;
    btw_percentage: number;
    incl_excl_btw: 'incl' | 'excl';
    leverancier_naam?: string;
    klant_naam?: string;
    omschrijving?: string;
    betaal_status?: string;
    betaal_account?: string;
    filter_label?: string;
}

interface ChartDataPoint {
    period: string;
    inkoopBTW: number;
    verkoopBTW: number;
    netBTW: number;
}

type PeriodType = 'week' | 'maand' | 'periode' | 'kwartaal' | 'jaar';

export default function BTWDashboard() {
    const [inkoopData, setInkoopData] = useState<InvoiceData[]>([]);
    const [verkoopData, setVerkoopData] = useState<InvoiceData[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('maand');
    const [exportLoading, setExportLoading] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFromDate, setExportFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]); // Start of current year
    const [exportToDate, setExportToDate] = useState(new Date().toISOString().split('T')[0]); // Today

    // Calculate BTW from invoice data
    const calculateBTW = (invoice: InvoiceData): number => {
        const { totaal_bedrag, btw_percentage, incl_excl_btw } = invoice;

        if (!btw_percentage || btw_percentage === 0) return 0;

        if (incl_excl_btw === 'incl') {
            // BTW = totaal_bedrag * (btw_percentage / (1 + btw_percentage))
            return totaal_bedrag * (btw_percentage / (1 + btw_percentage));
        } else {
            // BTW = totaal_bedrag * btw_percentage
            return totaal_bedrag * btw_percentage;
        }
    };

    // Load invoice data
    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) return;

                // Load inkoop facturen
                const { data: inkoop, error: inkoopError } = await supabase
                    .from('inkoop_facturen')
                    .select('*')
                    .eq('user_id', userData.user.id)
                    .order('factuur_datum', { ascending: false });

                // Load verkoop facturen
                const { data: verkoop, error: verkoopError } = await supabase
                    .from('verkoop_facturen')
                    .select('*')
                    .eq('user_id', userData.user.id)
                    .order('factuur_datum', { ascending: false });

                if (inkoopError) console.error('Error loading inkoop data:', inkoopError);
                if (verkoopError) console.error('Error loading verkoop data:', verkoopError);

                setInkoopData(inkoop || []);
                setVerkoopData(verkoop || []);

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Helper function to get current week number
    const getWeekNumber = (date: Date): number => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };

    // Helper function to get current period number (periods of 4 weeks, starting from week 1)
    const getPeriodNumber = (date: Date): number => {
        const weekNum = getWeekNumber(date);
        return Math.ceil(weekNum / 4);
    };

    // Generate chart data based on selected period (always 4 periods)
    useEffect(() => {
        if (!inkoopData.length && !verkoopData.length) return;

        const now = new Date();
        
        const generatePeriods = () => {
            const periods: string[] = [];

            switch (selectedPeriod) {
                case 'week':
                    const currentWeek = getWeekNumber(now);
                    for (let i = 3; i >= 0; i--) {
                        const weekNum = currentWeek - i;
                        periods.push(`Week ${weekNum}`);
                    }
                    break;
                
                case 'maand':
                    for (let i = 3; i >= 0; i--) {
                        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        periods.push(monthDate.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short' }));
                    }
                    break;
                
                case 'periode':
                    const currentPeriod = getPeriodNumber(now);
                    for (let i = 3; i >= 0; i--) {
                        const periodNum = currentPeriod - i;
                        periods.push(`Periode ${periodNum}`);
                    }
                    break;
                
                case 'kwartaal':
                    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
                    const currentYear = now.getFullYear();
                    for (let i = 3; i >= 0; i--) {
                        let quarterNum = currentQuarter - i;
                        let year = currentYear;
                        if (quarterNum <= 0) {
                            quarterNum += 4;
                            year -= 1;
                        }
                        periods.push(`Q${quarterNum} ${year}`);
                    }
                    break;
                
                case 'jaar':
                    for (let i = 3; i >= 0; i--) {
                        const year = now.getFullYear() - i;
                        periods.push(year.toString());
                    }
                    break;
            }
            return periods;
        };

        const periods = generatePeriods();
        const data: ChartDataPoint[] = periods.map((period, index) => {
            // Filter invoices for this period
            const isInPeriod = (invoiceDate: string) => {
                const invoice = new Date(invoiceDate);
                const invoiceYear = invoice.getFullYear();
                const invoiceMonth = invoice.getMonth();

                switch (selectedPeriod) {
                    case 'week':
                        const currentWeek = getWeekNumber(now);
                        const periodWeek = currentWeek - (3 - index);
                        const invoiceWeek = getWeekNumber(invoice);
                        return invoiceWeek === periodWeek && invoiceYear === now.getFullYear();

                    case 'maand':
                        const targetMonth = now.getMonth() - (3 - index);
                        let targetYear = now.getFullYear();
                        let adjustedMonth = targetMonth;
                        
                        if (targetMonth < 0) {
                            adjustedMonth = 12 + targetMonth;
                            targetYear -= 1;
                        }
                        
                        return invoiceMonth === adjustedMonth && invoiceYear === targetYear;

                    case 'periode':
                        const currentPeriod = getPeriodNumber(now);
                        const targetPeriod = currentPeriod - (3 - index);
                        const invoicePeriod = getPeriodNumber(invoice);
                        return invoicePeriod === targetPeriod && invoiceYear === now.getFullYear();

                    case 'kwartaal':
                        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
                        let targetQuarter = currentQuarter - (3 - index);
                        let targetQuarterYear = now.getFullYear();
                        
                        if (targetQuarter <= 0) {
                            targetQuarter += 4;
                            targetQuarterYear -= 1;
                        }
                        
                        const invoiceQuarter = Math.floor(invoice.getMonth() / 3) + 1;
                        return invoiceQuarter === targetQuarter && invoiceYear === targetQuarterYear;

                    case 'jaar':
                        const targetYearValue = now.getFullYear() - (3 - index);
                        return invoiceYear === targetYearValue;

                    default:
                        return false;
                }
            };

            const periodInkoop = inkoopData.filter(invoice => isInPeriod(invoice.factuur_datum));
            const periodVerkoop = verkoopData.filter(invoice => isInPeriod(invoice.factuur_datum));

            const inkoopBTW = periodInkoop.reduce((sum, invoice) => sum + calculateBTW(invoice), 0);
            const verkoopBTW = periodVerkoop.reduce((sum, invoice) => sum + calculateBTW(invoice), 0);
            const netBTW = verkoopBTW - inkoopBTW; // Positive = you owe, negative = you get back

            return {
                period,
                inkoopBTW: Math.round(inkoopBTW * 100) / 100,
                verkoopBTW: Math.round(verkoopBTW * 100) / 100,
                netBTW: Math.round(netBTW * 100) / 100
            };
        });

        setChartData(data);
    }, [inkoopData, verkoopData, selectedPeriod]);

    // Calculate current period totals
    const currentPeriodData = chartData.length > 0 ? chartData[chartData.length - 1] : null;

    // Export to Excel
    const exportToExcel = async () => {
        setExportLoading(true);

        try {
            const fromDate = new Date(exportFromDate);
            const toDate = new Date(exportToDate);
            toDate.setHours(23, 59, 59, 999); // Include the entire end date

            // Filter data by date range
            const filteredInkoopData = inkoopData.filter(invoice => {
                const invoiceDate = new Date(invoice.factuur_datum);
                return invoiceDate >= fromDate && invoiceDate <= toDate;
            });

            const filteredVerkoopData = verkoopData.filter(invoice => {
                const invoiceDate = new Date(invoice.factuur_datum);
                return invoiceDate >= fromDate && invoiceDate <= toDate;
            });

            const workbook = XLSX.utils.book_new();

            // Prepare inkoop data
            const inkoopExportData = filteredInkoopData.map(invoice => ({
                'Factuur Nummer': invoice.factuur_nummer,
                'Datum': invoice.factuur_datum,
                'Leverancier': invoice.leverancier_naam || '',
                'Omschrijving': invoice.omschrijving || '',
                'Totaal Bedrag': invoice.totaal_bedrag,
                'BTW %': (invoice.btw_percentage * 100) + '%',
                'Incl/Excl BTW': invoice.incl_excl_btw,
                'BTW Bedrag': Math.round(calculateBTW(invoice) * 100) / 100,
                'Betaal Status': invoice.betaal_status || '',
                'Betaal Account': invoice.betaal_account || '',
                'Filter Label': invoice.filter_label || ''
            }));

            // Prepare verkoop data
            const verkoopExportData = filteredVerkoopData.map(invoice => ({
                'Factuur Nummer': invoice.factuur_nummer,
                'Datum': invoice.factuur_datum,
                'Klant': invoice.klant_naam || '',
                'Omschrijving': invoice.omschrijving || '',
                'Totaal Bedrag': invoice.totaal_bedrag,
                'BTW %': (invoice.btw_percentage * 100) + '%',
                'Incl/Excl BTW': invoice.incl_excl_btw,
                'BTW Bedrag': Math.round(calculateBTW(invoice) * 100) / 100,
                'Betaal Status': invoice.betaal_status || '',
                'Betaal Account': invoice.betaal_account || '',
                'Filter Label': invoice.filter_label || ''
            }));

            // Create worksheets
            const inkoopWS = XLSX.utils.json_to_sheet(inkoopExportData);
            const verkoopWS = XLSX.utils.json_to_sheet(verkoopExportData);

            // Add worksheets to workbook
            XLSX.utils.book_append_sheet(workbook, inkoopWS, 'Inkoop Facturen');
            XLSX.utils.book_append_sheet(workbook, verkoopWS, 'Verkoop Facturen');

            // Export file with date range in filename
            const fileName = `BTW_Export_${exportFromDate}_tot_${exportToDate}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            setShowExportModal(false);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Er is een fout opgetreden bij het exporteren');
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-2"></div>
                        <p>Gegevens laden...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            BTW Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Inzicht in je BTW verplichtingen en teruggaves (laatste 4 periodes)
                        </p>
                    </div>

                    {/* Current Period Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Inkoop BTW (Teruggave)
                            </h3>
                            <p className="text-2xl font-bold text-green-600">
                                €{currentPeriodData?.inkoopBTW.toFixed(2) || '0.00'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Verkoop BTW (Te Betalen)
                            </h3>
                            <p className="text-2xl font-bold text-red-600">
                                €{currentPeriodData?.verkoopBTW.toFixed(2) || '0.00'}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                Netto BTW balans
                            </h3>
                            <p className={`text-2xl font-bold ${(currentPeriodData?.netBTW || 0) >= 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                €{currentPeriodData?.netBTW.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {(currentPeriodData?.netBTW || 0) >= 0 ? 'Te betalen aan belastingdienst' : 'Terug te krijgen'}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Periode Type:</label>
                                    <select
                                        value={selectedPeriod}
                                        onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
                                        className="border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                    >
                                        <option value="week">Per Week</option>
                                        <option value="maand">Per Maand</option>
                                        <option value="periode">Per Periode</option>
                                        <option value="kwartaal">Per Kwartaal</option>
                                        <option value="jaar">Per Jaar</option>
                                    </select>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p>Toont altijd de laatste 4 periodes</p>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => setShowExportModal(true)}
                            >
                                Download Excel
                            </Button>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-bold mb-4">BTW Trend (laatste 4 periodes)</h2>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number, name: string) => {
                                            const labels = {
                                                'inkoopBTW': 'Inkoop BTW (Teruggave)',
                                                'verkoopBTW': 'Verkoop BTW (Te Betalen)',
                                                'netBTW': 'Netto BTW balans'
                                            };
                                            return [`€${value.toFixed(2)}`, labels[name as keyof typeof labels] || name];
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="inkoopBTW"
                                        stroke="#10B981"
                                        name="Inkoop BTW (Teruggave)"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="verkoopBTW"
                                        stroke="#EF4444"
                                        name="Verkoop BTW (Te Betalen)"
                                        strokeWidth={2}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="netBTW"
                                        stroke="#6366F1"
                                        name="Netto BTW balans"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            <p>• Groene lijn: BTW die je terugkrijgt van inkopen</p>
                            <p>• Rode lijn: BTW die je moet betalen van verkopen</p>
                            <p>• Blauwe stippellijn: Netto BTW (positief = te betalen, negatief = terug te krijgen)</p>
                        </div>
                    </div>

                    {/* Data Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Inkoop Facturen</h3>
                            <p className="text-2xl font-bold text-blue-600 mb-2">{inkoopData.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Totaal: €{inkoopData.reduce((sum, inv) => sum + inv.totaal_bedrag, 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                BTW teruggave: €{inkoopData.reduce((sum, inv) => sum + calculateBTW(inv), 0).toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Verkoop Facturen</h3>
                            <p className="text-2xl font-bold text-blue-600 mb-2">{verkoopData.length}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Totaal: €{verkoopData.reduce((sum, inv) => sum + inv.totaal_bedrag, 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                BTW balans: €{verkoopData.reduce((sum, inv) => sum + calculateBTW(inv), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Excel Export</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Selecteer de periode voor export
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Van datum:</label>
                                <input
                                    type="date"
                                    value={exportFromDate}
                                    onChange={(e) => setExportFromDate(e.target.value)}
                                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tot datum:</label>
                                <input
                                    type="date"
                                    value={exportToDate}
                                    onChange={(e) => setExportToDate(e.target.value)}
                                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>Inkoop facturen: {inkoopData.filter(inv => {
                                    const date = new Date(inv.factuur_datum);
                                    return date >= new Date(exportFromDate) && date <= new Date(exportToDate);
                                }).length}</p>
                                <p>Verkoop facturen: {verkoopData.filter(inv => {
                                    const date = new Date(inv.factuur_datum);
                                    return date >= new Date(exportFromDate) && date <= new Date(exportToDate);
                                }).length}</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <Button
                                variant="secondary"
                                onClick={() => setShowExportModal(false)}
                            >
                                Annuleren
                            </Button>
                            <Button
                                variant="primary"
                                onClick={exportToExcel}

                            >
                                {exportLoading ? 'Exporteren...' : 'Download Excel'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}