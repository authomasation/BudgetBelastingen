// app/dashboard/page.tsx (Updated to use ProtectedRoute)
"use client";
import Image from "next/image";
import { useState } from "react";
import Footer from "@/components/Footer";
import AddInvoiceModal from "@/components/AddInvoiceModal";
import ExcelExportModal from "@/components/ExcelExportModal";
import VolgendeAangifte from "@/components/AangifteKlok";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

const baseButton = "h-12 rounded-full px-5 py-2 font-medium text-sm sm:text-base transition-colors flex items-center gap-2";

export default function Home() {
    const [showInvoiceOptions, setShowInvoiceOptions] = useState(false);

    const handleInvoiceManagementClick = () => {
        setShowInvoiceOptions(true);
    };

    const closeInvoiceOptions = () => {
        setShowInvoiceOptions(false);
    };

    return (
        <ProtectedRoute>
            <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                <main className="flex flex-col gap-[32px] row-start-2 items-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-gray-100 tracking-wide">
                        BudgetBelastingen
                    </h1>
                    
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex gap-4 flex-col">
                            <AddInvoiceModal />
                            
                            <button
                                className={`${baseButton} border border-gray-300 hover:bg-gray-100 hover:text-[#333]`}
                                onClick={handleInvoiceManagementClick}
                            >
                                <Image src="/edit.svg" alt="aanpassen" width={20} height={20} />
                                Facturen beheren
                            </button>
                        </div>
                        
                        <div className="flex gap-4 flex-col">
                            <a className={`${baseButton} border border-gray-300 hover:bg-gray-100 hover:text-[#333]`} href="#" rel="noopener noreferrer">
                                <Image src="/dashboards.svg" alt="dashboard" width={20} height={20} />
                                Overzicht & berekeningen
                            </a>
                            <ExcelExportModal />
                        </div>
                    </div>
                    
                    <VolgendeAangifte />
                </main>
                
                <Footer />
                
                {/* Invoice Management Type Selector Modal */}
                {showInvoiceOptions && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={closeInvoiceOptions}
                    >
                        <div
                            className="bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded-lg shadow-xl w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4 text-center">Facturen beheren</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                                Kies welk type facturen je wilt beheren
                            </p>
                            
                            <div className="space-y-4">
                                <Link
                                    href="/dashboard/inkoop_facturen"
                                    className="w-full p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center gap-3 text-decoration-none"
                                    onClick={closeInvoiceOptions}
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Image src="/shopping-cart.svg" alt="" width={16} height={16} className="text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-blue-700 dark:text-blue-300">Inkoop Facturen</div>
                                        <div className="text-sm text-blue-600 dark:text-blue-400">Beheer facturen van leveranciers</div>
                                    </div>
                                    <div className="text-blue-500">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m9 18 6-6-6-6"/>
                                        </svg>
                                    </div>
                                </Link>
                                
                                <Link
                                    href="/dashboard/verkoop_facturen"
                                    className="w-full p-4 rounded-lg border-2 border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center gap-3 text-decoration-none"
                                    onClick={closeInvoiceOptions}
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                        <Image src="/banknote.svg" alt="" width={16} height={16} className="text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-semibold text-green-700 dark:text-green-300">Verkoop Facturen</div>
                                        <div className="text-sm text-green-600 dark:text-green-400">Beheer facturen naar klanten</div>
                                    </div>
                                    <div className="text-green-500">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m9 18 6-6-6-6"/>
                                        </svg>
                                    </div>
                                </Link>
                                
                               
                            </div>
                            
                            <div className="mt-6 text-center">
                                <button
                                    onClick={closeInvoiceOptions}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Annuleren
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
